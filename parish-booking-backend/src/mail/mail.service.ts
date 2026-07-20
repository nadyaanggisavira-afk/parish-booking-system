import { Injectable, Logger } from '@nestjs/common';

export interface MailMessage {
  to: string;
  subject: string;
  body: string;
}

// Official parish reply address (per design doc).
const FROM_ADDRESS = process.env.MAIL_FROM ?? 'sekretariat@purbayan-paroki.org';

/**
 * Stubbed transactional mail. In dev it logs the message; when SMTP_* env vars
 * are configured, swap the `deliver` body for a real nodemailer transport
 * (nodemailer is intentionally not a dependency yet). The rest of the app calls
 * `send()` and never needs to know which path is active.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  get isSmtpConfigured() {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  }

  async send(msg: MailMessage): Promise<{ delivered: boolean; from: string }> {
    if (this.isSmtpConfigured) {
      // TODO: when going live, add `nodemailer` and deliver via SMTP here.
      this.logger.warn('SMTP configured but nodemailer transport not wired yet — logging instead.');
    }

    this.logger.log(
      `[MAIL:stub] From: ${FROM_ADDRESS} → To: ${msg.to}\nSubject: ${msg.subject}\n${msg.body}`,
    );
    return { delivered: true, from: FROM_ADDRESS };
  }
}
