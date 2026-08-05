import { Global, Module } from '@nestjs/common';
import { EmailLogRepo } from './email-log.repo';
import { EmailService } from './email.service';
import { SmtpMailer } from './smtp.mailer';

@Global()
@Module({
  providers: [SmtpMailer, EmailLogRepo, EmailService],
  exports: [EmailService, SmtpMailer],
})
export class EmailModule {}
