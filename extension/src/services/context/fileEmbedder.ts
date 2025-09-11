import { EmbeddingFunction, FunctionOptions } from '@lancedb/lancedb/embedding';
import { pipeline } from '@xenova/transformers';
import { Float32 } from 'apache-arrow';

export class FileEmbedder extends EmbeddingFunction<string, FunctionOptions> {
  private model: any;
  name: 'fileEmbedder';
  ndims = () => 384;
  sourceColumn = () => 'text';
  vectorColumn = () => 'vector';
  embeddingDataType = () => new Float32();
  computeSourceEmbeddings = async (sources: string[]) => {
    return this.embed(sources);
  };

  private async ensureModel() {
    if (!this.model) {
      this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    await this.ensureModel();

    const vectors: number[][] = [];
    for (const t of texts) {
      const out = await this.model(t, { pooling: 'mean', normalize: true });
      const flat = Array.isArray(out.data) ? out.data : Array.from(out.data);
      vectors.push(flat);
    }

    return vectors;
  }
}
