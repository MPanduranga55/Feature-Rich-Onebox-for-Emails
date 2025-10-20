import { Client } from '@elastic/elasticsearch';
import { ES_HOST, ES_USERNAME, ES_PASSWORD } from './env';

export const esClient = new Client({
  node: ES_HOST,
  auth: ES_USERNAME && ES_PASSWORD ? { username: ES_USERNAME, password: ES_PASSWORD } : undefined,
});
