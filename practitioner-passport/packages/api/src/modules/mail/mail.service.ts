import nodemailer, { Transporter } from "nodemailer";
import { config } from "../../shared/config/env";

type MailerContext = {
  transporter: Transporter;
  usingEthereal: boolean;
};

export class MailService {
  private transporterPromise: Promise<MailerContext>;

  constructor() {
    this.transporterPromise = this.createTransporter();
  }

  private async createTransporter(): Promise<MailerContext> {
    if (config.smtpHost && config.smtpPort && config.smtpUser && config.smtpPass) {
      return {
        transporter: nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass,
          },
        }),
        usingEthereal: false,
      };
    }

    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      usingEthereal: true,
    };
  }

  async sendSignupVerification(params: {
    fullName: string;
    email: string;
    verifyUrl: string;
  }): Promise<{ previewUrl: string | false | null }> {
    const { fullName, email, verifyUrl } = params;
    const { transporter, usingEthereal } = await this.transporterPromise;

    const info = await transporter.sendMail({
      from: config.mailFrom,
      to: email,
      subject: "Verify your Practitioner Passport account",
      text: `Hello ${fullName},\n\nClick this verification link to complete your signup:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
      html: `<p>Hello ${fullName},</p><p>Click this verification link to complete your signup:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link expires in 24 hours.</p>`,
    });

    console.log("signup email sent", {
      to: email,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return {
      previewUrl: usingEthereal ? nodemailer.getTestMessageUrl(info) : null,
    };
  }
}
