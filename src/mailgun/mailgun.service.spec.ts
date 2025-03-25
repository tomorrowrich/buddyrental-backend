import { Test, TestingModule } from '@nestjs/testing';
import { MailgunService } from './mailgun.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailgunModuleOptions } from '@app/interfaces/mailgun.interface';

describe('MailgunService', () => {
  let service: MailgunService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get<MailgunService>(MailgunService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
