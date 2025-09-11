import * as lancedb from '@lancedb/lancedb';
import { Table } from '@lancedb/lancedb';
import { getRegistry, LanceSchema, register } from '@lancedb/lancedb/embedding';
import { Utf8 } from 'apache-arrow';
import * as vscode from 'vscode';

import { FileChunk, uuid } from '../../utils';
import { FileEmbedder } from './fileEmbedder';

export class EmbeddingsDBClient {
  private dbPath: string;
  private db: lancedb.Connection;
  private fileTable: Table;
  private fileTableName = 'files';
  private embedder: FileEmbedder;

  constructor(private context: vscode.ExtensionContext) {
    this.embedder = new FileEmbedder();
  }

  async activate() {
    this.dbPath = this.context.globalStorageUri.fsPath;
    await vscode.workspace.fs.createDirectory(this.context.globalStorageUri);

    this.db = await lancedb.connect(this.dbPath);
    register(FileEmbedder.name)(FileEmbedder);
  }

  async init() {
    const fileEmbedderFn = getRegistry().get(FileEmbedder.name)?.create();
    if (!fileEmbedderFn) {
      throw new Error('Embedder not found');
    }
    const schema = LanceSchema({
      text: fileEmbedderFn.sourceField(new Utf8()),
      vector: fileEmbedderFn.vectorField(),
      filePath: new Utf8(),
      id: new Utf8(),
      workspace: new Utf8(),
    });

    this.fileTable = await this.db.createEmptyTable(this.fileTableName, schema, {
      mode: 'overwrite',
      existOk: true,
    });
    console.log(`Created table: ${this.fileTableName}`);
  }

  async addFiles(chunks: FileChunk[]) {
    await this.fileTable.add(
      chunks.map((el) => {
        Object.assign(el, { id: uuid() });
        return el;
      }),
    );
  }

  async searchFiles(
    search: string,
    filters?: { workspace: string; filePath?: string },
    limit = 5,
  ): Promise<FileChunk[]> {
    if (!this.fileTableName) throw new Error('Table not initialized. Call init().');
    if (!this.embedder) throw new Error('Embedder not initialized.');

    const queryEmbedding = (await this.embedder.embed([search]))[0];

    let query = this.fileTable.search(queryEmbedding).limit(limit);

    const filterExpressions: string[] = [];
    if (filters?.workspace) filterExpressions.push(`workspace = '${filters.workspace}'`);
    if (filters?.filePath) filterExpressions.push(`filePath LIKE '%${filters.filePath}%'`);

    if (filterExpressions.length > 0) {
      query = query.where(filterExpressions.join(' AND '));
    }

    const results = await query.toArray();
    return Array.from(new Map(results.map((r) => [r.id, r])).values()) as FileChunk[];
  }
}
