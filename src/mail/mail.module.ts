import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: `"No Reply" <noreply@example.com>`,
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class EmailModule {}
