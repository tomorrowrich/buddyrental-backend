/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReservationService', () => {
  let reservationService: ReservationService;
  let prismaService: PrismaService;

  const mockReservations = [
    {
      id: 'res1',
      userId: 'cust1',
      reservationDate: new Date('2023-10-01'),
      buddy: { buddyId: 'buddy1' },
    },
    {
      id: 'res2',
      userId: 'cust1',
      reservationDate: new Date('2023-09-30'),
      buddy: { buddyId: 'buddy2' },
    },
  ];

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
        orderBy: { reservationDate: 'desc' },
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
        orderBy: { reservationDate: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });
});
