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
      `Reset your BuddyRental password using this link: ${resetLink}.\nIf you did not request this link, do not perform any action.`,
      `<p>Reset your BuddyRental password using this link: ${resetLink}</p><p>If you did not request this link, do not perform any action.</p>`,
    );
  }
}
