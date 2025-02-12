import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { ReservationModule } from './reservation/reservation.module';
import { ConfigModule } from '@nestjs/config';
import mockConfig from './config/mock.config';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    CredentialsModule,
    ReservationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mockConfig],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
