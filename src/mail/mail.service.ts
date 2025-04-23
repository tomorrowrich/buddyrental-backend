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

  sendResetPasswordEmail(to: string, resetLink: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.8;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            background-color: #f5f5f5;
          }
          .container {
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background-color: #ffffff;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            margin: 20px auto;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #FF5733;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .content {
            padding: 25px 0;
            background-color: #ffffff;
            border-radius: 8px;
          }
          h2 {
            color: #FF5733;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
            position: relative;
          }
          h2:after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background-color: #FF9033;
            border-radius: 3px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #FF5733, #FF9033);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 50px;
            margin: 25px 0;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(255, 87, 51, 0.3);
            transition: all 0.3s ease;
            border: none;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(255, 87, 51, 0.4);
          }
          .link-text {
            background-color: #f8f8f8;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #FF5733;
            margin: 15px 0;
            word-break: break-all;
          }
          .important-note {
            background-color: rgba(255, 87, 51, 0.05);
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #FF5733;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #888;
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            line-height: 1.6;
          }
          .social-icons {
            margin: 15px 0;
          }
          .social-icons a {
            display: inline-block;
            margin: 0 8px;
            color: #FF5733;
            font-size: 18px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BuddyRental</div>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your BuddyRental password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <div class="link-text">
              <a href="${resetLink}" style="color: #FF5733; font-weight: bold; text-decoration: underline;">${resetLink}</a>
            </div>
            <div class="important-note">
              <p><strong>Important:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
          </div>
          <div class="footer">
            <div class="social-icons">
              <a href="#">●</a>
              <a href="#">●</a>
              <a href="#">●</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} BuddyRental. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>BuddyRental Inc, 123 Rental Street, San Francisco, CA 94103</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - BuddyRental

      Hello,

      We received a request to reset your BuddyRental password. Please use the link below to create a new password:

      ${resetLink}

      Important: If you didn't request this password reset, please ignore this email or contact support if you have concerns.

      © ${new Date().getFullYear()} BuddyRental. All rights reserved.
      This is an automated message. Please do not reply to this email.
    `;

    return this.sendMail(to, 'Reset Your BuddyRental Password', text, html);
  }
}
