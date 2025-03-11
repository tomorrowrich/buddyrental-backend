import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { PrismaService } from '@app/prisma/prisma.service';
import { ReservationService } from '@app/reservation/reservation.service';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleController } from './schedule.controller';
import { ConfigService } from '@nestjs/config';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule],
      controllers: [ScheduleController],
      providers: [
        ScheduleService,
        ReservationService,
        PrismaService,
        ConfigService,
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
