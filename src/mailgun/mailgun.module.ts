import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailgunService } from './mailgun.service';
import { MailgunModuleOptions } from '@app/interfaces/mailgun.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MailgunService,
      useFactory: (configService: ConfigService) => {
        const options: MailgunModuleOptions = {
          domain: configService.get<string>('MAILGUN_DOMAIN') || 'example',
          apiKey: configService.get<string>('MAILGUN_API_KEY') || 'example',
          fromEmail:
            configService.get<string>('MAILGUN_FROM_EMAIL') || 'example',
        };
        return new MailgunService(options);
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailgunService],
})
export class MailgunModule {}
