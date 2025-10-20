import { Client } from '@elastic/elasticsearch';
import { config } from '../config/env';
import { EmailDocument } from '../types/email';

const EMAIL_INDEX = 'emails';
let esClient: Client;


export async function initializeElasticsearch() {
  console.log('[ES] Connecting to Elasticsearch...');
  esClient = new Client({ node: config.elasticsearchUrl });
  
  try {
    await esClient.ping({});
    console.log('[ES] Successfully connected to Elasticsearch.');

    const indexExists = await esClient.indices.exists({ index: EMAIL_INDEX });

    if (!indexExists.body) {
      console.log(`[ES] Index '${EMAIL_INDEX}' does not exist. Creating now...`);
      await esClient.indices.create({
        index: EMAIL_INDEX,
        body: {
          mappings: {
            properties: {
              subject: { type: 'text' }, 
              body: { type: 'text' },     
              accountId: { type: 'keyword' }, 
              folder: { type: 'keyword' },    
              date: { type: 'date' },
              aiCategory: { type: 'keyword' }
            }
          }
        }
      });
      console.log(`[ES] Index '${EMAIL_INDEX}' created successfully.`);
    }
  } catch (error) {
    console.error('[ES] ERROR: Failed to initialize Elasticsearch.', error);
    throw error;
  }
}


export async function indexEmail(email: EmailDocument) {
  try {
    await esClient.index({
      index: EMAIL_INDEX,
      id: email.id, 
      document: email,
    });
  } catch (error) {
    console.error('[ES] Error indexing email:', email.id, error);
  }
}

export async function searchEmails(
    query: string, 
    accountId?: string, 
    folder?: string
) {
  
  const mustQueries: any[] = [];
  const filterQueries: any[] = [];
  

  if (query) {
    mustQueries.push({ 
        multi_match: { 
            query: query, 
            fields: ['subject', 'body'] 
        } 
    });
  } else {
      mustQueries.push({ match_all: {} });
  }

  if (accountId) {
    filterQueries.push({ term: { accountId: accountId } });
  }
  if (folder) {
    filterQueries.push({ term: { folder: folder } });
  }

  try {
    const response = await esClient.search({
      index: EMAIL_INDEX,
      body: {
        query: {
          bool: {
            must: mustQueries,
            filter: filterQueries 
          }
        },
        sort: [{ date: 'desc' }] 
      },
      size: 50 
    });

    return response.body.hits.hits.map((hit: any) => hit._source as EmailDocument);

  } catch (error) {
    console.error('[ES] Error searching emails:', error);
    return [];
  }
}