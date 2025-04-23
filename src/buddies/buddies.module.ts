import { Module } from '@nestjs/common';
import { BuddiesController } from './buddies.controller';
import { BuddiesService } from './buddies.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BuddiesController],
  providers: [BuddiesService, PrismaService],
  exports: [BuddiesService],
})
export class BuddiesModule {}
