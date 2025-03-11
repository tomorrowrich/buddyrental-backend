import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { PrismaService } from '@app/prisma/prisma.service';
import { ReservationService } from '@app/reservation/reservation.service';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleService } from './schedule.service';
import { ConfigService } from '@nestjs/config';

describe('ScheduleController', () => {
  let controller: ScheduleController;

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

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
