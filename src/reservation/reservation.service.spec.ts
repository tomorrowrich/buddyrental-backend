/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let prismaService: PrismaService;

  const mockReservations = [];

  const prismaServiceMock = {
    reservationRecord: {
      findMany: jest.fn(),
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookingHistory', () => {
    it('should return an array of reservation records ordered by reservationDate descending', async () => {
      prismaServiceMock.reservationRecord.findMany.mockResolvedValue(
        mockReservations,
      );

      const result = await reservationService.getBookingHistory('cust1');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'cust1' },
        include: {
          buddy: {
            select: { buddyId: true },
          },
        },
        orderBy: { reservationStart: 'desc' },
      });
      expect(result).toEqual(mockReservations);
    });

    it('should return an empty array if no reservations are found', async () => {
      prismaServiceMock.reservationRecord.findMany.mockResolvedValue([]);

      const result = await reservationService.getBookingHistory('cust2');

      expect(prismaService.reservationRecord.findMany).toHaveBeenCalledWith({
        where: { userId: 'cust2' },
        include: {
          buddy: {
            select: { buddyId: true },
          },
        },
        orderBy: { reservationStart: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });
});
