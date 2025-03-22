/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleService } from '@app/schedule/schedule.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleStatus } from '@prisma/client';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let prismaService: PrismaService;
  // Renamed to _scheduleService to indicate that it's unused
  let _scheduleService: ScheduleService;

  const mockReservations = [];
  const mockSchedule = {
    scheduleId: 'schedule1',
    status: ScheduleStatus.UNCONFIRMED,
  };

  // Define types for the mocks to avoid 'any' errors
  type PrismaMock = {
    reservationRecord: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    buddy: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const prismaServiceMock: PrismaMock = {
    reservationRecord: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    buddy: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(
      (callback: (prisma: PrismaMock) => Promise<unknown>) =>
        callback(prismaServiceMock),
    ),
  };

  const scheduleServiceMock = {
    createSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: ScheduleService, useValue: scheduleServiceMock },
        {
          provide: PrismaService,
          useValue: prismaServiceMock as unknown as PrismaService,
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    prismaService = module.get<PrismaService>(PrismaService);
    _scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReservationHistory', () => {
    it('should return an array of reservation records ordered by reservationStart descending', async () => {
      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );

      const result = await reservationService.getReservationHistory('buddy1');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
        include: {
          user: true,
        },
        orderBy: { reservationStart: 'desc' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('getBookingHistory', () => {
    it('should return an array of reservation records ordered by reservationStart descending', async () => {
      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );

      const result = await reservationService.getBookingHistory('user1');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          buddy: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { reservationStart: 'desc' },
      });
      expect(result).toEqual(mockReservations);
    });
  });

  describe('createReservation', () => {
    const createReservationDto = {
      buddyId: 'buddy1',
      price: 100,
      reservationStart: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      reservationEnd: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    };

    it('should throw BadRequestException if userId is not provided', async () => {
      await expect(
        reservationService.createReservation('', createReservationDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if reservation start date is in the past', async () => {
      const pastDto = {
        ...createReservationDto,
        reservationStart: new Date(Date.now() - 3600000).toISOString(),
      };
      await expect(
        reservationService.createReservation('user1', pastDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if end date is before or equal to start date', async () => {
      const invalidDto = {
        ...createReservationDto,
        reservationEnd: createReservationDto.reservationStart,
      };
      await expect(
        reservationService.createReservation('user1', invalidDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if buddy is not found', async () => {
      prismaServiceMock.buddy.findUnique.mockResolvedValue(null);
      await expect(
        reservationService.createReservation('user1', createReservationDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a reservation successfully', async () => {
      prismaServiceMock.buddy.findUnique.mockResolvedValue({
        buddyId: 'buddy1',
      });
      scheduleServiceMock.createSchedule.mockResolvedValue(mockSchedule);

      const mockReservation = {
        reservationId: 'res1',
        userId: 'user1',
        buddyId: 'buddy1',
        price: 100,
        status: 'PENDING',
        scheduleId: 'schedule1',
      };

      prismaServiceMock.reservationRecord.create.mockResolvedValue(
        mockReservation,
      );
      prismaServiceMock.$transaction.mockImplementation(
        async (callback: (prisma: PrismaMock) => Promise<unknown>) => {
          return await callback(prismaServiceMock);
        },
      );

      const result = await reservationService.createReservation(
        'user1',
        createReservationDto,
      );

      expect(prismaServiceMock.buddy.findUnique).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
      });
      expect(scheduleServiceMock.createSchedule).toHaveBeenCalled();
      expect(prismaServiceMock.reservationRecord.create).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: {
          reservation: mockReservation,
          schedule: mockSchedule,
        },
      });
    });
  });

  describe('confirmReservation', () => {
    const mockReservation = {
      reservationId: 'res1',
      userId: 'user1',
      buddyId: 'buddy1',
      status: 'PENDING',
      scheduleId: 'schedule1',
    };

    it('should throw NotFoundException if reservation is not found', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(null);
      await expect(
        reservationService.confirmReservation('buddy1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'ACCEPTED',
      });
      await expect(
        reservationService.confirmReservation('buddy1', 'res1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not the buddy', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );
      await expect(
        reservationService.confirmReservation('user2', 'res1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should confirm a reservation successfully', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );
      prismaServiceMock.reservationRecord.update.mockResolvedValue({
        ...mockReservation,
        status: 'ACCEPTED',
      });
      scheduleServiceMock.updateSchedule.mockResolvedValue({
        ...mockSchedule,
        status: ScheduleStatus.BUSY,
      });

      const result = await reservationService.confirmReservation(
        'buddy1',
        'res1',
      );

      expect(prismaServiceMock.reservationRecord.update).toHaveBeenCalledWith({
        where: { reservationId: 'res1' },
        data: { status: 'ACCEPTED' },
      });
      expect(scheduleServiceMock.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        { status: ScheduleStatus.BUSY },
      );
      expect(result.success).toBe(true);
    });
  });
});
