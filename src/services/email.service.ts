import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

// Email configuration - only create if SMTP credentials are provided
const isEmailConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

// Debug log to check env vars
logger.info('Initializing Email Service', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER ? 'Set' : 'Not Set',
  pass: process.env.SMTP_PASS ? 'Set' : 'Not Set',
  isConfigured: !!isEmailConfigured
});

if (isEmailConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Only verify in development to avoid cold start delays in serverless environments

    const verifyTransporter = async () => {
      logger.info('Starting email service verification...');
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Email service verification timed out after 5000ms'));
        }, 5000);

        transporter!.verify((error) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        });
      });
    };

    verifyTransporter()
      .then(() => {
        logger.success('Email service is ready');
      })
      .catch((error) => {
        logger.error('Email service verification failed', error);
      });


  } catch (error) {
    logger.error('Failed to create email transport', error);
  }
} else {
  logger.warn('Email service disabled - SMTP credentials not provided');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 * @param options - Email options (to, subject, html, text)
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!transporter) {
      logger.warn('Email service not configured - skipping email send');
      return;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Backend Starter Kit'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}`, { messageId: info.messageId });
  } catch (error) {
    logger.error('Failed to send email', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email
 * @param to - Recipient email
 * @param name - User name
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Our Platform! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for registering with us! We're excited to have you on board.</p>
          <p>Your account has been successfully created and you can now start using all our features.</p>
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: 'Welcome to Our Platform!',
    html,
    text: `Hi ${name}, Thank you for registering with us! Your account has been successfully created.`,
  });
};

/**
 * Send password reset email
 * @param to - Recipient email
 * @param name - User name
 * @param resetToken - Password reset token
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>This link will expire in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: 'Password Reset Request',
    html,
    text: `Hi ${name}, Click this link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
  });
};
