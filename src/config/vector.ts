import { QdrantClient } from 'qdrant-client';
import { QDRANT_URL, QDRANT_API_KEY } from './env';

export const qdrant = new QdrantClient({ url: QDRANT_URL, apiKey: QDRANT_API_KEY || undefined });
