import { pipeline } from '@xenova/transformers';
import * as vscode from 'vscode';

import { FileChunk, filePatterns, foldersPattern, getWorkspaceName } from '../utils';

export class Context {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private embedder: any;
  private modelName = 'Xenova/all-MiniLM-L6-v2';
  private _embeddings: { [key: string]: FileChunk[] } = {};

  get embeddings() {
    return this._embeddings[getWorkspaceName()] ?? [];
  }

  set embeddings(embeddings: FileChunk[]) {
    this._embeddings[getWorkspaceName()] = embeddings;
  }

  constructor(
    private maxFiles = 50,
    private maxChars = 5000,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async init(progress_callback: (chunk: any) => void) {
    try {
      const opts = { quantized: true, progress_callback };
      this.embedder = await pipeline('feature-extraction', this.modelName, opts);
    } catch (err) {
      console.error('Failed to initialize model:', err);
    }
  }

  async indexFile(uri: vscode.Uri) {
    if (!vscode.workspace.workspaceFolders?.length || !this.embedder) return [];
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    const bytes = await vscode.workspace.fs.readFile(uri);
    const content = new TextDecoder().decode(bytes).slice(0, this.maxChars);
    const texts = content.match(/[\s\S]{1,500}/g) || [];
    const filePath = uri.fsPath.replace(root + '/', '');
    const chunks: FileChunk[] = [];
    for (const text of texts) {
      const embedding = await this.createEmbedding(text).catch(() => []);
      chunks.push({ filePath, text, embedding });
    }
    return chunks;
  }

  async indexWorkspace() {
    let uris: vscode.Uri[] = [];

    for (const pattern of filePatterns) {
      const found = await vscode.workspace.findFiles(pattern, foldersPattern, this.maxFiles * 3);
      uris.push(...found);
      if (uris.length >= this.maxFiles) break;
    }

    uris = uris.slice(0, this.maxFiles);
    const chunks: FileChunk[] = [];

    for (const uri of uris) {
      const fileChunks = await this.indexFile(uri);
      chunks.concat(fileChunks);
    }

    this.embeddings = chunks;
  }

  async createEmbedding(text: string): Promise<number[]> {
    const result = await this.embedder(text);
    return Array.isArray(result) ? result : Array.from(result.data);
  }

  async searchRelevant(query: string, topN = 5): Promise<FileChunk[]> {
    if (!this.embeddings.length) return [];

    const queryEmb = await this.createEmbedding(query);

    const cosine = (a: number[], b: number[]) => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return dot / (magA * magB);
    };

    const scored = this.embeddings.map((chunk) => ({
      chunk,
      score: cosine(queryEmb, chunk.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topN).map((s) => s.chunk);
  }
}
