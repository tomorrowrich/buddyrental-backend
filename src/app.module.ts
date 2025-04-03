import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReservationModule } from './reservation/reservation.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { InterestsModule } from './interests/interests.module';
import { BuddyModule } from './buddy/buddy.module';
import { ChatModule } from './chat/chat.module';
import { ScheduleModule } from './schedule/schedule.module';
import configLoader from './config';
import { StorageModule } from './storage/storage.module';
import { BuddiesModule } from './buddies/buddies.module';
import { TagsModule } from './tags/tags.module';
import { MailModule } from './mail/mail.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ReservationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configLoader],
      envFilePath: ['.env'],
    }),
    AdminModule,
    StorageModule,
    InterestsModule,
    BuddyModule,
    ChatModule,
    ScheduleModule,
    BuddiesModule,
    TagsModule,
    MailModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
