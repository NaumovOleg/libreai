import * as lancedb from '@lancedb/lancedb';
import { Table } from '@lancedb/lancedb';
import { getRegistry, LanceSchema, register } from '@lancedb/lancedb/embedding';
import { Utf8 } from 'apache-arrow';
import * as vscode from 'vscode';

import { DbFile, FileChunk, getWorkspaceName } from '../../utils';
import { FileEmbedder } from './fileEmbedder';

export class DatabaseClient {
  private dbPath: string;
  private db!: lancedb.Connection;
  private fileTable!: Table;
  private fileTableName = 'files';
  private embedder: FileEmbedder;

  constructor(private context: vscode.ExtensionContext) {
    this.embedder = new FileEmbedder();
    this.dbPath = this.context.globalStorageUri.fsPath;
  }

  async init() {
    this.dbPath = this.context.globalStorageUri.fsPath;
    await vscode.workspace.fs.createDirectory(this.context.globalStorageUri);

    this.db = await lancedb.connect(this.dbPath);
    register(FileEmbedder.name)(FileEmbedder);
    const fileEmbedderFn = getRegistry().get(FileEmbedder.name)?.create();
    if (!fileEmbedderFn) {
      throw new Error('Embedder not found');
    }
    const schema = LanceSchema({
      text: fileEmbedderFn.sourceField(new Utf8()),
      vector: fileEmbedderFn.vectorField(),
      path: new Utf8(),
      id: new Utf8(),
      workspace: new Utf8(),
    });

    this.fileTable = await this.db.createEmptyTable(this.fileTableName, schema, {
      mode: 'overwrite',
      existOk: true,
    });
    console.log(`Created table: ${this.fileTableName}`);
  }

  async checkWorkspaceIndex() {
    const existed = (await this.fileTable
      .search('*')
      .where(`workspace = '${getWorkspaceName()}'`)
      .limit(1)
      .toArray()) as DbFile[];

    return !!existed.length;
  }

  async indexFiles(chunks: DbFile[]) {
    if (!this.fileTable) throw new Error('Table not initialized. Call init().');

    const filePaths = chunks.map((c) => c.path);
    const existingRows = (await this.fileTable
      .search('*')
      .where(`path IN (${filePaths.map((fp) => `'${fp}'`).join(',')})`)
      .toArray()) as DbFile[];

    if (existingRows.length) {
      await this.fileTable.delete(`id IN (${existingRows.map(({ id }) => `'${id}'`).join(',')})`);
    }

    return this.fileTable.add(chunks);
  }

  async deleteFiles(paths: string[]) {
    return this.fileTable.delete(`path IN (${paths.map((p) => `'${p}'`).join(',')})`);
  }

  async searchKNN(
    search: string,
    filters: { workspace: string; path?: string },
    limit = 5,
  ): Promise<FileChunk[]> {
    if (!this.fileTableName) throw new Error('Table not initialized. Call init().');
    if (!this.embedder) throw new Error('Embedder not initialized.');

    const queryEmbedding = (await this.embedder.embed([search]))[0];

    const query = this.fileTable
      .search(queryEmbedding)
      .where(`workspace = '${filters.workspace}'`)
      .limit(limit);

    const results = await query.toArray();
    return Array.from(new Map(results.map((r) => [r.id, r])).values()) as FileChunk[];
  }
}
