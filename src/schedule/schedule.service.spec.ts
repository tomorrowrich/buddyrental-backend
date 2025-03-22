import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '@app/prisma/prisma.service';
import { ReservationService } from '@app/reservation/reservation.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService, ReservationService, PrismaService],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
