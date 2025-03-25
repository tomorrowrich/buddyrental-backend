// mailgun.service.ts
import { MailgunModuleOptions } from '@app/interfaces/mailgun.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';

type MailgunClient = ReturnType<Mailgun['client']>;

@Injectable()
export class MailgunService {
  private mailgunClient: MailgunClient;

  constructor(private readonly options: MailgunModuleOptions) {
    const mailgun = new Mailgun(FormData);
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: options.apiKey,
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      return await this.mailgunClient.messages.create(this.options.domain, {
        from: this.options.fromEmail,
        to,
        subject,
        text,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
