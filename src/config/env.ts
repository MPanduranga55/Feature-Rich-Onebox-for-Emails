import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  
  imapAccount1: {
    host: process.env.IMAP_ACCOUNT_1_HOST,
    port: Number(process.env.IMAP_ACCOUNT_1_PORT), 
    username: process.env.IMAP_ACCOUNT_1_USERNAME,
    password: process.env.IMAP_ACCOUNT_1_PASSWORD,
  },
  imapAccount2: {
    host: process.env.IMAP_ACCOUNT_2_HOST,
    port: Number(process.env.IMAP_ACCOUNT_2_PORT),
    username: process.env.IMAP_ACCOUNT_2_USERNAME,
    password: process.env.IMAP_ACCOUNT_2_PASSWORD,
  },

  elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  geminiApiKey: process.env.GEMINI_API_KEY,
  
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  webhookSiteUrl: process.env.WEBHOOK_SITE_URL,
};