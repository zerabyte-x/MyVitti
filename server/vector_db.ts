
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: process.env.MILVUS_URI || 'localhost:19530',
  username: process.env.MILVUS_USERNAME,
  password: process.env.MILVUS_PASSWORD
});

export const vectorDb = {
  async initialize() {
    try {
      await client.createCollection({
        collection_name: 'learning_content',
        dimension: 1536,
        metric_type: 'L2'
      });
    } catch (error) {
      console.error('Vector DB initialization error:', error);
    }
  },

  async addDocument(content: string, embedding: number[]) {
    try {
      await client.insert({
        collection_name: 'learning_content',
        data: [{ content, embedding }]
      });
    } catch (error) {
      console.error('Vector DB insert error:', error);
    }
  },

  async search(queryEmbedding: number[], limit: number = 5) {
    try {
      const results = await client.search({
        collection_name: 'learning_content',
        vector: queryEmbedding,
        limit
      });
      return results;
    } catch (error) {
      console.error('Vector DB search error:', error);
      return [];
    }
  }
};
