
import { createWorker } from 'tesseract.js';
import { load } from '@tensorflow-models/universal-sentence-encoder';

export class DocumentProcessor {
  private static async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType.includes('pdf')) {
      // PDF processing logic would go here
      return '';
    } else if (mimeType.includes('image')) {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      return text;
    }
    return '';
  }

  private static async getEmbedding(text: string): Promise<number[]> {
    const model = await load();
    const embeddings = await model.embed([text]);
    return Array.from(embeddings.dataSync());
  }

  static async process(buffer: Buffer, mimeType: string) {
    const text = await this.extractText(buffer, mimeType);
    const embedding = await this.getEmbedding(text);
    return { text, embedding };
  }
}
