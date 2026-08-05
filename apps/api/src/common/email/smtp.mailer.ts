import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { loadSmtpConfig, SmtpRuntimeConfig } from './smtp.config';

export type SmtpSendResult = {
  accepted: boolean;
  messageId?: string;
  response?: string;
  skipped?: boolean;
  reason?: string;
};

@Injectable()
export class SmtpMailer implements OnModuleDestroy {
  private readonly logger = new Logger(SmtpMailer.name);
  private readonly config: SmtpRuntimeConfig;
  private transporter: Transporter | null = null;

  constructor() {
    this.config = loadSmtpConfig();
    if (this.config.enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth:
          this.config.user && this.config.pass
            ? { user: this.config.user, pass: this.config.pass }
            : undefined,
      });
      this.logger.log(
        `SMTP ready host=${this.config.host}:${this.config.port} from=${this.config.from}`,
      );
    } else {
      this.logger.warn(
        'Email sending disabled or SMTP_HOST missing — messages only logged',
      );
    }
  }

  get fromEmail() {
    return this.config.from;
  }

  get fromName() {
    return this.config.fromName;
  }

  get isEnabled() {
    return this.config.enabled && this.transporter != null;
  }

  async send(input: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<SmtpSendResult> {
    if (!this.isEnabled || !this.transporter) {
      return {
        accepted: false,
        skipped: true,
        reason: 'SMTP not configured (set ENABLE_EMAIL=true and SMTP_HOST)',
      };
    }

    const to =
      input.toName && input.toName.trim()
        ? `"${input.toName.replace(/"/g, '')}" <${input.to}>`
        : input.to;

    const info = await this.transporter.sendMail({
      from: `"${this.config.fromName.replace(/"/g, '')}" <${this.config.from}>`,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return {
      accepted: (info.accepted?.length ?? 0) > 0,
      messageId: info.messageId,
      response: typeof info.response === 'string' ? info.response : undefined,
    };
  }

  async onModuleDestroy() {
    if (this.transporter && 'close' in this.transporter) {
      this.transporter.close();
    }
  }
}
