import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BuddiesModule } from './buddies/buddies.module';
import { BuddyModule } from './buddy/buddy.module';
import { ChatModule } from './chat/chat.module';
import configLoader from './config';
import { InterestsModule } from './interests/interests.module';
import { MailModule } from './mail/mail.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { ReservationModule } from './reservation/reservation.module';
import { ScheduleModule } from './schedule/schedule.module';
import { StorageModule } from './storage/storage.module';
import { StripeModule } from './stripe/stripe.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';

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
    StripeModule,
    PaymentModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
