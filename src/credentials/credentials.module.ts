import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
