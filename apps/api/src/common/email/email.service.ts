import { Injectable, Logger } from '@nestjs/common';
import { EmailLogStatus, Prisma } from '@prisma/client';
import { EmailLogRepo } from './email-log.repo';
import {
  OrderConfirmationMailData,
  SendMailRequest,
} from './mail.types';
import { SmtpMailer } from './smtp.mailer';
import {
  orderConfirmationTemplateKey,
  renderOrderConfirmationMail,
} from './templates/order-confirmation.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailer: SmtpMailer,
    private readonly emailLogRepo: EmailLogRepo,
  ) {}

  async sendOrderConfirmation(data: OrderConfirmationMailData): Promise<void> {
    const rendered = renderOrderConfirmationMail(data);
    await this.send({
      to: data.customerEmail,
      toName: data.customerName,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      templateKey: orderConfirmationTemplateKey(),
      relatedType: 'order',
      relatedId: data.orderId,
      meta: {
        orderNumber: data.orderNumber,
        totalInPaise: data.totalInPaise,
        itemCount: data.items.length,
      },
    });
  }

  async send(
    request: SendMailRequest,
  ): Promise<{ logId: string; status: EmailLogStatus }> {
    const meta =
      request.meta === undefined
        ? undefined
        : (JSON.parse(JSON.stringify(request.meta)) as Prisma.InputJsonValue);

    const log = await this.emailLogRepo.create({
      toEmail: request.to,
      toName: request.toName,
      fromEmail: this.mailer.fromEmail,
      subject: request.subject,
      templateKey: request.templateKey,
      status: EmailLogStatus.PENDING,
      relatedType: request.relatedType,
      relatedId: request.relatedId,
      meta,
      htmlBody: request.html,
      textBody: request.text,
    });

    try {
      const result = await this.mailer.send({
        to: request.to,
        toName: request.toName,
        subject: request.subject,
        html: request.html,
        text: request.text,
      });

      if (result.skipped) {
        await this.emailLogRepo.markSkipped(
          log.id,
          result.reason || 'SMTP skipped',
        );
        this.logger.warn(
          `Email skipped log=${log.id} template=${request.templateKey} to=${request.to}`,
        );
        return { logId: log.id, status: EmailLogStatus.SKIPPED };
      }

      if (!result.accepted) {
        await this.emailLogRepo.markFailed(
          log.id,
          result.response || 'SMTP did not accept message',
        );
        this.logger.error(
          `Email rejected log=${log.id} template=${request.templateKey} to=${request.to}`,
        );
        return { logId: log.id, status: EmailLogStatus.FAILED };
      }

      await this.emailLogRepo.markSent(log.id, {
        providerMessageId: result.messageId,
      });
      this.logger.log(
        `Email sent log=${log.id} template=${request.templateKey} to=${request.to} id=${result.messageId}`,
      );
      return { logId: log.id, status: EmailLogStatus.SENT };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      await this.emailLogRepo.markFailed(log.id, message);
      this.logger.error(
        `Email failed log=${log.id} template=${request.templateKey} to=${request.to}: ${message}`,
      );
      return { logId: log.id, status: EmailLogStatus.FAILED };
    }
  }
}
