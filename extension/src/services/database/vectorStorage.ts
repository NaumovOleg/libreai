/* eslint-disable max-len */
import * as lancedb from '@lancedb/lancedb';
import { Table } from '@lancedb/lancedb';
import { getRegistry, LanceSchema, register } from '@lancedb/lancedb/embedding';
import { DbFile, FileChunk } from '@utils';
import { Utf8 } from 'apache-arrow';
import * as vscode from 'vscode';

import { FileEmbedder } from './embedder';

export class VectorStorage {
  private dbPath: string;
  private db!: lancedb.Connection;
  private fileTable!: Table;
  private fileTableName = 'files';
  private embedder: FileEmbedder;
  private static _instance: VectorStorage;

  static getInstance(context?: vscode.ExtensionContext) {
    if (context && !VectorStorage._instance) {
      VectorStorage._instance = new VectorStorage(context);
    }
    return VectorStorage._instance;
  }

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

    const tables = await this.db.tableNames();
    if (tables.includes(this.fileTableName)) {
      this.fileTable = await this.db.openTable(this.fileTableName);
      console.log(`Opened existing table: ${this.fileTableName}`);
    } else {
      this.fileTable = await this.db.createEmptyTable(this.fileTableName, schema);
      console.log(`Created new table: ${this.fileTableName}`);
    }
  }

  async isWorkspaceIndexed(workspace: string) {
    const existed = (await this.fileTable
      .search('*')
      .where(`workspace = '${workspace}'`)
      .limit(1)
      .toArray()) as DbFile[];

    return !!existed.length;
  }

  async putFileChunks(chunks: DbFile[], deleteFiles = true) {
    if (!this.fileTable) throw new Error('Table not initialized. Call init().');
    if (!chunks.length) {
      return [];
    }

    const workspaces = [...new Set(chunks.map((file) => file.workspace))];

    const paths = chunks.map((c) => c.path);
    if (deleteFiles) {
      await this.fileTable.delete(
        `path IN (${paths.map((fp) => `'${fp.replace(/'/g, "''")}'`).join(',')})
   AND workspace IN (${workspaces.map((ws) => `'${ws.replace(/'/g, "''")}'`).join(',')})`,
      );
    }

    return this.fileTable.add(chunks);
  }

  async deleteFiles(paths: string[]) {
    return this.fileTable.delete(`path IN (${paths.map((p) => `'${p}'`).join(',')})`);
  }

  async clearWorkspace(workspace: string) {
    return this.fileTable.delete(`workspace = '${workspace}'`);
  }

  async searchKNN(
    search: string,
    filters: { workspaces: string[]; path?: string },
    limit = 5,
  ): Promise<FileChunk[]> {
    if (!this.fileTableName) throw new Error('Table not initialized. Call init().');
    if (!this.embedder) throw new Error('Embedder not initialized.');

    const queryEmbedding = (await this.embedder.embed([search]))[0];

    const escapedWorkspaces = filters.workspaces
      .map((ws) => `'${ws.replace(/'/g, "''")}'`)
      .join(',');

    const query = this.fileTable
      .search(queryEmbedding)
      .where(`workspace IN (${escapedWorkspaces})`)
      .limit(limit);

    const results = await query.toArray();
    const filesMap = new Map(results.map((r) => [r.id, r]));
    return Array.from(filesMap.values()) as FileChunk[];
  }
}
