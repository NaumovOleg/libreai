import { pipeline } from '@xenova/transformers';
import * as vscode from 'vscode';

export interface FileChunk {
  filePath: string;
  text: string;
  embedding: number[];
}

export class WorkspaceContext {
  private embeddings: FileChunk[] = [];
  private embedder: any;

  constructor(private context: vscode.ExtensionContext) {}

  async init() {
    try {
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    } catch (err) {
      console.error('Failed to initialize model:', err);
    }
  }

  async indexWorkspace(maxFiles = 50, maxChars = 5000) {
    if (!vscode.workspace.workspaceFolders?.length) return;
    const root = vscode.workspace.workspaceFolders[0].uri.fsPath;

    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.py',
      '**/*.md',
      '**/*.json',
      '**/*.html',
      '**/*.scss',
      '**/*.css',
      '**/*.cpp',
    ];
    let uris: vscode.Uri[] = [];

    for (const pattern of patterns) {
      const found = await vscode.workspace.findFiles(pattern, '**/node_modules/**', maxFiles * 3);
      uris.push(...found);
      if (uris.length >= maxFiles) break;
    }

    uris = uris.slice(0, maxFiles);

    const chunks: FileChunk[] = [];

    for (const uri of uris) {
      try {
        const bytes = await vscode.workspace.fs.readFile(uri);
        const text = new TextDecoder().decode(bytes).slice(0, maxChars);
        const pieces = text.match(/[\s\S]{1,500}/g) || [];
        for (const piece of pieces) {
          const emb = await this.createEmbedding(piece);
          chunks.push({
            filePath: uri.fsPath.replace(root + '/', ''),
            text: piece,
            embedding: emb,
          });
        }
      } catch (err) {
        console.error('Failed to read file for embeddings', uri.fsPath, err);
      }
    }

    this.embeddings = chunks;
    console.log('Workspace embeddings created:', this.embeddings);
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
