import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InterestsController],
  providers: [InterestsService],
})
export class InterestsModule {}
