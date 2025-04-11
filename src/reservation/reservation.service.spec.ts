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
import { NotificationsService } from '@app/notifications/notifications.service';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let prismaService: PrismaService;
  let scheduleService: ScheduleService;

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
      count: jest.Mock;
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
      count: jest.fn(),
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
        NotificationsService,
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    prismaService = module.get<PrismaService>(PrismaService);
    scheduleService = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReservationHistory', () => {
    it('should return an array of reservation records ordered by reservationStart descending with pagination', async () => {
      const mockTotalCount = 20;
      const expectedPageCount = 2; // Math.ceil(20/10)
      const take = 10;
      const skip = 0;

      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );
      prismaServiceMock.reservationRecord.count.mockResolvedValue(
        mockTotalCount,
      );

      const result = await reservationService.getReservationHistory(
        'buddy1',
        take,
        skip,
      );

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              email: true,
              phoneNumber: true,
              citizenId: true,
              address: true,
              interests: true,
            },
          },
        },
        orderBy: { reservationStart: 'desc' },
        take,
        skip,
      });
      expect(prismaService.reservationRecord.count).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
      });
      expect(result).toEqual({
        data: mockReservations,
        totalCount: expectedPageCount,
      });
    });

    it('should use default pagination values if not provided', async () => {
      const mockTotalCount = 20;
      const expectedPageCount = 2; // Math.ceil(20/10)
      const defaultTake = 10;
      const defaultSkip = 0;

      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );
      prismaServiceMock.reservationRecord.count.mockResolvedValue(
        mockTotalCount,
      );

      const result = await reservationService.getReservationHistory('buddy1');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { buddyId: 'buddy1' },
        include: {
          user: {
            select: {
              userId: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              email: true,
              phoneNumber: true,
              citizenId: true,
              address: true,
              interests: true,
            },
          },
        },
        orderBy: { reservationStart: 'desc' },
        take: defaultTake,
        skip: defaultSkip,
      });
      expect(result).toEqual({
        data: mockReservations,
        totalCount: expectedPageCount,
      });
    });
  });

  describe('getBookingHistory', () => {
    it('should return an array of reservation records ordered by reservationStart descending with pagination', async () => {
      const mockTotalCount = 15;
      const expectedPageCount = 2; // Math.ceil(15/10)
      const take = 10;
      const skip = 5;

      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );
      prismaServiceMock.reservationRecord.count.mockResolvedValue(
        mockTotalCount,
      );

      const result = await reservationService.getBookingHistory(
        'user1',
        take,
        skip,
      );

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          buddy: {
            include: {
              user: {
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  email: true,
                  phoneNumber: true,
                  citizenId: true,
                  address: true,
                },
              },
              tags: {
                select: {
                  tagId: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { reservationStart: 'desc' },
        take,
        skip,
      });
      expect(prismaService.reservationRecord.count).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
      expect(result).toEqual({
        data: mockReservations,
        totalCount: expectedPageCount,
      });
    });

    it('should use default pagination values if not provided', async () => {
      const mockTotalCount = 15;
      const expectedPageCount = 2; // Math.ceil(15/10)
      const defaultTake = 10;
      const defaultSkip = 0;

      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );
      prismaServiceMock.reservationRecord.count.mockResolvedValue(
        mockTotalCount,
      );

      const result = await reservationService.getBookingHistory('user1');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          buddy: {
            include: {
              user: {
                select: {
                  userId: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  email: true,
                  phoneNumber: true,
                  citizenId: true,
                  address: true,
                },
              },
              tags: {
                select: {
                  tagId: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { reservationStart: 'desc' },
        take: defaultTake,
        skip: defaultSkip,
      });
      expect(result).toEqual({
        data: mockReservations,
        totalCount: expectedPageCount,
      });
    });
  });

  describe('createReservation', () => {
    const createReservationDto = {
      buddyId: 'buddy1',
      price: 100,
      detail: 'test detail',
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

    it('should throw BadRequestException if user tries to reserve themselves', async () => {
      const selfReservationDto = {
        ...createReservationDto,
        buddyId: 'user1',
      };
      await expect(
        reservationService.createReservation('user1', selfReservationDto),
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
        detail: 'test detail',
        status: 'PENDING',
        scheduleId: 'schedule1',
        reservationStart: new Date(createReservationDto.reservationStart),
        reservationEnd: new Date(createReservationDto.reservationEnd),
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
      expect(scheduleServiceMock.createSchedule).toHaveBeenCalledWith(
        'buddy1',
        new Date(createReservationDto.reservationStart),
        new Date(createReservationDto.reservationEnd),
        ScheduleStatus.UNCONFIRMED,
        'Reservation with their budder',
      );
      expect(prismaServiceMock.reservationRecord.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          buddyId: 'buddy1',
          price: 100,
          status: 'PENDING',
          detail: 'test detail',
          reservationStart: new Date(createReservationDto.reservationStart),
          reservationEnd: new Date(createReservationDto.reservationEnd),
          scheduleId: 'schedule1',
        },
      });
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

      const updatedReservation = {
        ...mockReservation,
        status: 'ACCEPTED',
      };

      const updatedSchedule = {
        ...mockSchedule,
        status: ScheduleStatus.BUSY,
      };

      prismaServiceMock.reservationRecord.update.mockResolvedValue(
        updatedReservation,
      );
      scheduleServiceMock.updateSchedule.mockResolvedValue(updatedSchedule);

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
      expect(result).toEqual({
        success: true,
        data: {
          reservation: updatedReservation,
          schedule: updatedSchedule,
        },
      });
    });
  });

  describe('rejectReservation', () => {
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
        reservationService.rejectReservation('buddy1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'ACCEPTED',
      });
      await expect(
        reservationService.rejectReservation('buddy1', 'res1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not the buddy', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );
      await expect(
        reservationService.rejectReservation('user2', 'res1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject a reservation successfully', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );

      const rejectedReservation = {
        ...mockReservation,
        status: 'REJECTED',
      };

      prismaServiceMock.reservationRecord.update.mockResolvedValue(
        rejectedReservation,
      );

      const result = await reservationService.rejectReservation(
        'buddy1',
        'res1',
      );

      expect(prismaServiceMock.reservationRecord.update).toHaveBeenCalledWith({
        where: { reservationId: 'res1' },
        data: { status: 'REJECTED' },
      });
      expect(scheduleServiceMock.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        {
          status: 'AVAILABLE',
        },
      );
      expect(result).toEqual({
        success: true,
        data: { reservation: rejectedReservation },
      });
    });
  });

  describe('cancelReservation', () => {
    const mockReservation = {
      reservationId: 'res1',
      userId: 'user1',
      buddyId: 'buddy1',
      status: 'PENDING',
      scheduleId: 'schedule1',
      buddy: {
        userId: 'buddy1',
      },
    };

    it('should throw NotFoundException if reservation is not found', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(null);
      await expect(
        reservationService.cancelReservation('user1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reservation is not pending or accepted', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'COMPLETED',
      });
      await expect(
        reservationService.cancelReservation('user1', 'res1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not part of the reservation', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );
      await expect(
        reservationService.cancelReservation('user2', 'res1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow buddy to cancel a reservation', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );

      const cancelledReservation = {
        ...mockReservation,
        status: 'CANCELLED',
      };

      prismaServiceMock.reservationRecord.update.mockResolvedValue(
        cancelledReservation,
      );

      const result = await reservationService.cancelReservation(
        'buddy1',
        'res1',
      );

      expect(prismaServiceMock.reservationRecord.update).toHaveBeenCalledWith({
        where: { reservationId: 'res1' },
        data: { status: 'CANCELLED' },
      });
      expect(scheduleServiceMock.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        { status: 'AVAILABLE' },
      );
      expect(result).toEqual({
        success: true,
        data: { reservation: cancelledReservation },
      });
    });

    it('should allow user to cancel a reservation', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );

      const cancelledReservation = {
        ...mockReservation,
        status: 'CANCELLED',
      };

      prismaServiceMock.reservationRecord.update.mockResolvedValue(
        cancelledReservation,
      );

      const result = await reservationService.cancelReservation(
        'user1',
        'res1',
      );

      expect(prismaServiceMock.reservationRecord.update).toHaveBeenCalledWith({
        where: { reservationId: 'res1' },
        data: { status: 'CANCELLED' },
      });
      expect(scheduleServiceMock.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        { status: 'AVAILABLE' },
      );
      expect(result).toEqual({
        success: true,
        data: { reservation: cancelledReservation },
      });
    });
  });

  describe('completeReservation', () => {
    const mockReservation = {
      reservationId: 'res1',
      userId: 'user1',
      buddyId: 'buddy1',
      status: 'ACCEPTED',
      scheduleId: 'schedule1',
    };

    it('should throw NotFoundException if reservation is not found', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(null);
      await expect(
        reservationService.completeReservation('buddy1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if reservation is not accepted', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue({
        ...mockReservation,
        status: 'PENDING',
      });
      await expect(
        reservationService.completeReservation('buddy1', 'res1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not the buddy', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );
      await expect(
        reservationService.completeReservation('user2', 'res1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should complete a reservation successfully', async () => {
      prismaServiceMock.reservationRecord.findUnique.mockResolvedValue(
        mockReservation,
      );

      const completedReservation = {
        ...mockReservation,
        status: 'COMPLETED',
      };

      prismaServiceMock.reservationRecord.update.mockResolvedValue(
        completedReservation,
      );

      const result = await reservationService.completeReservation(
        'buddy1',
        'res1',
      );

      expect(prismaServiceMock.reservationRecord.update).toHaveBeenCalledWith({
        where: { reservationId: 'res1' },
        data: { status: 'COMPLETED' },
      });
      expect(scheduleServiceMock.updateSchedule).toHaveBeenCalledWith(
        'schedule1',
        { status: 'AVAILABLE' },
      );
      expect(result).toEqual({
        success: true,
        data: { reservation: completedReservation },
      });
    });
  });
});
