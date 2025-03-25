import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to send email',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  resetPassword(to: string, resetLink: string) {
    return this.sendMail(
      to,
      'Password Reset',
      `Reset your password using this link: ${resetLink}`,
      `<p>Reset your password using this link: ${resetLink}</p>`,
    );
  }
}
