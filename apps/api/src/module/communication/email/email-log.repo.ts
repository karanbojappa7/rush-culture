import { Injectable } from '@nestjs/common';
import { EmailLog, EmailLogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { utcNow } from '../../../common/utility/date.utility';

@Injectable()
export class EmailLogRepo {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    toEmail: string;
    toName?: string;
    fromEmail: string;
    subject: string;
    templateKey: string;
    status?: EmailLogStatus;
    relatedType?: string;
    relatedId?: string;
    meta?: Prisma.InputJsonValue;
    htmlBody?: string;
    textBody?: string;
  }): Promise<EmailLog> {
    const stamp = utcNow();
    return this.prisma.emailLog.create({
      data: {
        toEmail: data.toEmail,
        toName: data.toName,
        fromEmail: data.fromEmail,
        subject: data.subject,
        templateKey: data.templateKey,
        status: data.status ?? EmailLogStatus.PENDING,
        relatedType: data.relatedType,
        relatedId: data.relatedId,
        meta: data.meta,
        htmlBody: data.htmlBody,
        textBody: data.textBody,
        createdAt: stamp,
        updatedAt: stamp,
        isDeleted: false,
      },
    });
  }

  markSent(
    id: string,
    payload: { providerMessageId?: string },
  ): Promise<EmailLog> {
    const stamp = utcNow();
    return this.prisma.emailLog.update({
      where: { id },
      data: {
        status: EmailLogStatus.SENT,
        providerMessageId: payload.providerMessageId,
        sentAt: stamp,
        updatedAt: stamp,
        errorMessage: null,
      },
    });
  }

  markFailed(id: string, errorMessage: string): Promise<EmailLog> {
    return this.prisma.emailLog.update({
      where: { id },
      data: {
        status: EmailLogStatus.FAILED,
        errorMessage: errorMessage.slice(0, 4000),
        updatedAt: utcNow(),
      },
    });
  }

  markSkipped(id: string, reason: string): Promise<EmailLog> {
    return this.prisma.emailLog.update({
      where: { id },
      data: {
        status: EmailLogStatus.SKIPPED,
        errorMessage: reason.slice(0, 4000),
        updatedAt: utcNow(),
      },
    });
  }
}
