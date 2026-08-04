import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not defined. Notifications will run in sandbox/mock logging mode.');
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    
    if (this.resend) {
      try {
        const response = await this.resend.emails.send({
          from: fromEmail,
          to,
          subject,
          html,
        });
        this.logger.log(`Email successfully sent to ${to} via Resend. ID: ${response.data?.id}`);
        return { success: true, messageId: response.data?.id };
      } catch (err) {
        this.logger.error(`Resend API call failed: ${err.message}. Falling back to mock logger.`);
      }
    }

    // Mock logger fallback
    this.logger.log(`[MOCK EMAIL SENT]
      From: ${fromEmail}
      To: ${to}
      Subject: ${subject}
      Body Snippet: ${html.substring(0, 150)}...
    `);
    return { success: true, mock: true };
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to AtlasForecast Premium! 🌤️';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #6366f1;">Welcome to AtlasForecast Premium, ${name}!</h2>
        <p>Thank you for choosing AtlasForecast. Your premium subscription is now active.</p>
        <p>Here is what you can access now:</p>
        <ul>
          <li><strong>AI Weather Copilot</strong>: Personalized travel, hiking, agri & events advice.</li>
          <li><strong>ML Predictions Engine</strong>: Accurate risk percentages.</li>
          <li><strong>Real-time Smart Alerts</strong>: Instant webhook, SMS, and email reports.</li>
          <li><strong>Climatic Data Access</strong>: Full developer keys.</li>
        </ul>
        <p>Get started now: <a href="http://localhost:5173/premium" style="color: #3b82f6;">Go to Premium Portal</a></p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendSevereAlertEmail(to: string, city: string, alertType: string, severity: string, details: string) {
    const subject = `⚠️ SEVERE WEATHER ALERT: ${alertType} in ${city}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ef4444; border-radius: 10px; background-color: #fef2f2;">
        <h2 style="color: #ef4444; margin: 0;">Weather Alert Warning</h2>
        <h3 style="margin-top: 5px;">${alertType} - Severity: ${severity}</h3>
        <p>A severe weather warning has been triggered for <strong>${city}</strong>:</p>
        <blockquote style="background-color: #ffffff; padding: 10px; border-left: 4px solid #ef4444; margin: 10px 0;">
          ${details}
        </blockquote>
        <p style="font-size: 0.85rem; color: #7f1d1d;">Please take necessary precautions. You are receiving this because your Smart Alerts configurations are active on AtlasForecast.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendDailyDigestEmail(to: string, city: string, summary: string, forecastDays: any[]) {
    const subject = `📊 Daily Weather Digest for ${city} - AtlasForecast`;
    const listItems = forecastDays.map((d: any) => `
      <tr style="border-bottom: 1px solid #eaeaea;">
        <td style="padding: 8px; font-weight: bold;">${d.day}</td>
        <td style="padding: 8px; color: #3b82f6;">${d.temp}°C</td>
        <td style="padding: 8px; color: #4b5563;">${d.description}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #6366f1;">Your Daily Digest</h2>
        <p>Good morning! Here is your weather outlook for <strong>${city}</strong>:</p>
        <p style="font-style: italic; background-color: #f3f4f6; padding: 10px; border-radius: 8px;">"${summary}"</p>
        
        <h3 style="margin-top: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 5px;">Weekly Overview</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 8px; text-align: left;">Day</th>
              <th style="padding: 8px; text-align: left;">Temp</th>
              <th style="padding: 8px; text-align: left;">Condition</th>
            </tr>
          </thead>
          <tbody>
            ${listItems}
          </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 0.85rem; color: #6b7280;">Configure these digests in your AtlasForecast Premium Settings.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendSubscriptionEmail(to: string, plan: string, action: 'created' | 'updated' | 'cancelled') {
    const subject = `Billing Status: Plan ${action.toUpperCase()}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #6366f1;">AtlasForecast Subscription Update</h2>
        <p>We are writing to confirm that your subscription to the <strong>${plan.toUpperCase()} Plan</strong> has been successfully <strong>${action}</strong>.</p>
        <p>If you have any questions or did not authorize this change, please contact our support team immediately.</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
