import type { ISlackMessage } from '@/lib/types';

export class AlertingService {
  private static instance: AlertingService;
  private readonly slackWebhookUrl: string | null = null;

  private constructor() {
    this.slackWebhookUrl = process.env.SLACK_ALERT_WEBHOOK_URL ?? null;
  }

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService();
    }
    return AlertingService.instance;
  }

  async sendSlackAlert(auditData: Record<string, unknown>): Promise<void> {
    if (!this.slackWebhookUrl) {
      console.warn('SLACK_ALERT_WEBHOOK_URL not configured, skipping Slack alert');
      return;
    }

    try {
      const message = this.formatSlackMessage(auditData);
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('Slack alert sent successfully');
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
      // Don't throw - alerting failure shouldn't break the main flow
    }
  }

  private formatSlackMessage(auditData: Record<string, unknown>): ISlackMessage {
    const severity = auditData.severity as string;
    const category = auditData.category as string;
    const action = auditData.action as string;
    const userId = auditData.user_id as string;
    const description = auditData.description as string;
    const timestamp = auditData.timestamp as string;
    const success = auditData.success as boolean;
    const errorMessage = auditData.error_message as string;

    return {
      text: `🚨 *CRITICAL AUDIT EVENT* - ${action}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Critical Security Event: ${action}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Category:*\n${category}` },
            { type: 'mrkdwn', text: `*Action:*\n${action}` },
            { type: 'mrkdwn', text: `*Severity:*\n${severity.toUpperCase()}` },
            { type: 'mrkdwn', text: `*User:*\n${userId || 'Unknown'}` },
            { type: 'mrkdwn', text: `*Timestamp:*\n${timestamp}` },
            { type: 'mrkdwn', text: `*Status:*\n${success ? '✅ Success' : '❌ Failed'}` },
          ],
        },
        ...(description
          ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Description:*\n${description}`,
                },
              },
            ]
          : []),
        ...(errorMessage
          ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Error:*\n${errorMessage}`,
                },
              },
            ]
          : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🔍 <https://your-app.com/admin/audit-logs|View in Admin Panel>',
            },
          ],
        },
      ],
    };
  }

  sendEmailAlert(_auditData: Record<string, unknown>): void {
    // TODO: Implement email alerting if needed
    console.log('Email alerting not implemented yet');
  }

  sendWebhookAlert(_auditData: Record<string, unknown>): void {
    // TODO: Implement generic webhook alerting if needed
    console.log('Webhook alerting not implemented yet');
  }
}

export const alertingService = AlertingService.getInstance();
