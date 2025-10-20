import { EmailDocument } from '../types/email';
import { config } from '../config/env';
async function sendSlackNotification(email: EmailDocument) {
    const slackUrl = config.slackWebhookUrl;
    if (!slackUrl) {
        return console.warn('[Webhook] SLACK_WEBHOOK_URL not configured. Skipping Slack.');
    }

    const payload = {
        text: ` NEW INTERESTED LEAD! \n*From:* ${email.from}\n*Subject:* ${email.subject}\n*Account:* ${email.accountId}`,
    };

    try {
        await fetch(slackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log('[Webhook] Slack notification sent.');
    } catch (error) {
        console.error('[Webhook] Error sending Slack notification:', error);
    }
}
async function triggerExternalWebhook(email: EmailDocument) {
    const webhookUrl = config.webhookSiteUrl;
    if (!webhookUrl) {
        return console.warn('[Webhook] WEBHOOK_SITE_URL not configured. Skipping external webhook.');
    }
    const payload = {
        event: 'InterestedLead',
        emailData: {
            subject: email.subject,
            from: email.from,
            bodyPreview: email.body.substring(0, 150) + '...',
        }
    };

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        console.log('[Webhook] External webhook triggered.');
    } catch (error) {
        console.error('[Webhook] Error triggering external webhook:', error);
    }
}
export async function triggerIntegrations(email: EmailDocument) {
    console.log(`[Webhook] Running integrations for: ${email.subject}`);
    await Promise.all([
        sendSlackNotification(email),
        triggerExternalWebhook(email)
    ]);
}