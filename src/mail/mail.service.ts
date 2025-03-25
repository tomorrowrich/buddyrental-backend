import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<SentMessageInfo> {
    try {
      return await this.mailerService.sendMail({ to, subject, text, html });
    } catch (error) {
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
