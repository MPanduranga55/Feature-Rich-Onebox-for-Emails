import { Email } from '../types/email';
import { esClient } from '../config/elasticsearch';

export async function indexEmail(email: Email) {
  await esClient.index({ index: 'emails', id: email.id, body: email } as any);
}

export async function searchEmails(query: string) {
  const res = await esClient.search({ index: 'emails', q: query } as any);
  return res;
}
