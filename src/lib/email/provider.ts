/**
 * Email provider interface and implementations
 * Supports Resend and Nodemailer with fallback to console logging
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>;
}

/**
 * Resend email provider implementation
 */
export class ResendProvider implements EmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      // Dynamic import to avoid loading if not configured
      const { Resend } = await import("resend");
      const resend = new Resend(this.apiKey);
      
      await resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error("Resend email error:", error);
      return false;
    }
  }
}

/**
 * Nodemailer email provider implementation
 */
export class NodemailerProvider implements EmailProvider {
  private config: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
  };
  private fromEmail: string;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: { user: string; pass: string };
    fromEmail: string;
  }) {
    this.config = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    };
    this.fromEmail = config.fromEmail;
  }

  async send(options: EmailOptions): Promise<boolean> {
    try {
      // Dynamic import to avoid loading if not configured
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport(this.config);
      
      await transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error("Nodemailer email error:", error);
      return false;
    }
  }
}

/**
 * Console email provider (fallback when no email service is configured)
 */
export class ConsoleProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<boolean> {
    console.log("=== EMAIL (Console Fallback) ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log("--- Text Content ---");
    console.log(options.text);
    console.log("--- HTML Content ---");
    console.log(options.html);
    console.log("================================");
    return true;
  }
}

/**
 * Get configured email provider based on environment variables
 */
export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER;

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const fromEmail = process.env.EMAIL_FROM || "noreply@racegarage.local";
    return new ResendProvider(process.env.RESEND_API_KEY, fromEmail);
  }

  if (provider === "nodemailer") {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM;

    if (host && port && user && pass && fromEmail) {
      return new NodemailerProvider({
        host,
        port: parseInt(port),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
        fromEmail,
      });
    }
  }

  // Fallback to console provider
  console.log(
    "Email provider not configured. Using console fallback. Set EMAIL_PROVIDER in .env"
  );
  return new ConsoleProvider();
}
