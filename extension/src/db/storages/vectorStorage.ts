/* eslint-disable max-len */
import * as lancedb from '@lancedb/lancedb';
import { Table } from '@lancedb/lancedb';
import { getRegistry, LanceSchema, register } from '@lancedb/lancedb/embedding';
import { DbFile, FileChunk } from '@utils';
import { Int32, Utf8 } from 'apache-arrow';
import * as vscode from 'vscode';

import { FileEmbedder } from './embedder';

export class VectorStorage {
  private dbPath: string;
  private db!: lancedb.Connection;
  private embedder: FileEmbedder;
  private tables: { [key: string]: lancedb.Table } = {};

  constructor(private context: vscode.ExtensionContext) {
    this.embedder = new FileEmbedder();
    this.dbPath = this.context.globalStorageUri.fsPath;
  }

  async init() {
    this.dbPath = this.context.globalStorageUri.fsPath;
    await vscode.workspace.fs.createDirectory(this.context.globalStorageUri);
    this.db = await lancedb.connect(this.dbPath);
    register(FileEmbedder.name)(FileEmbedder);
  }

  private getTableNameForWorkspace(workspace: string): string {
    return `files_${workspace.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  }

  private async getOrCreateTable(workspace: string): Promise<Table> {
    const tableName = this.getTableNameForWorkspace(workspace);

    if (this.tables[tableName]) return this.tables[tableName];
    const tables = await this.db.tableNames();
    let table: Table;
    const fileEmbedderFn = getRegistry().get(FileEmbedder.name)?.create();
    if (!fileEmbedderFn) {
      throw new Error('Embedder not found');
    }
    const schema = LanceSchema({
      text: fileEmbedderFn.sourceField(new Utf8()),
      vector: fileEmbedderFn.vectorField(),
      path: new Utf8(),
      startLine: new Int32(),
      endLine: new Int32(),
      id: new Utf8(),
      workspace: new Utf8(),
    });
    if (tables.includes(tableName)) {
      const existing = await this.db.openTable(tableName);
      let existingSchema = await existing.schema();
      const existedModel = existingSchema.fields.map((f) => f.name);
      const newSchema = schema.fields.map((f) => f.name);

      const same = JSON.stringify(existedModel) === JSON.stringify(newSchema);
      if (!same) {
        console.log(`Schema changed for ${tableName}, recreating...`);
        await this.db.dropTable(tableName);
        table = await this.db.createEmptyTable(tableName, schema);
      } else {
        table = existing;
      }
      console.log(`Opened existing table: ${tableName}`);
    } else {
      table = await this.db.createEmptyTable(tableName, schema);
      console.log(`Created new table: ${tableName}`);
    }
    this.tables[tableName] = table;
    return table;
  }

  async isWorkspaceIndexed(workspace: string) {
    console.log('IS WORKSPACE INDEXED', workspace);
    const table = await this.getOrCreateTable(workspace);
    const existed = (await table.search('*').limit(1).toArray()) as DbFile[];
    return !!existed.length;
  }

  async putFileChunks(chunks: DbFile[], deleteFiles = true) {
    console.log('PUT FILE CHUNKS', chunks);
    if (!chunks.length) {
      return [];
    }

    const workspaceGroups: Record<string, DbFile[]> = {};
    for (const chunk of chunks) {
      if (!workspaceGroups[chunk.workspace]) {
        workspaceGroups[chunk.workspace] = [];
      }
      workspaceGroups[chunk.workspace].push(chunk);
    }
    const results = [];
    for (const workspace of Object.keys(workspaceGroups)) {
      const table = await this.getOrCreateTable(workspace);
      const wsChunks = workspaceGroups[workspace];
      const paths = wsChunks.map((c) => c.path);
      if (deleteFiles && paths.length > 0) {
        await table.delete(
          `path IN (${paths.map((fp) => `'${fp.replace(/'/g, "''")}'`).join(',')})`,
        );
      }
      results.push(await table.add(wsChunks));
    }
    return results;
  }

  async deleteFiles(workspace: string, paths: string[]) {
    console.log('DELETE FILES ', workspace);
    const table = await this.getOrCreateTable(workspace);
    return table.delete(`path IN (${paths.map((p) => `'${p.replace(/'/g, "''")}'`).join(',')})`);
  }

  async clearWorkspace(workspace: string) {
    console.log('CLEAR WORKSPACE', workspace);
    const table = await this.getOrCreateTable(workspace);
    return table.delete('true');
  }

  async searchKNN(search: string, workspaces: string[], limit = 5): Promise<FileChunk[]> {
    if (!this.embedder) throw new Error('Embedder not initialized.');
    const queryEmbedding = (await this.embedder.embed([search]))[0];
    let results: (FileChunk & { _distance: number })[] = [];
    for (const workspace of workspaces) {
      const table = await this.getOrCreateTable(workspace);
      let query = table.search(queryEmbedding).limit(limit);

      const wsResults = await query.toArray();
      results = results.concat(wsResults as (FileChunk & { _distance: number })[]);
    }

    const sorted = results.sort((a, b) => (a._distance > b._distance ? 1 : -1));
    return sorted.slice(0, limit);
  }
}
