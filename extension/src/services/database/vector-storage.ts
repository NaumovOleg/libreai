import { HuggingFaceEmbedding } from '@llamaindex/huggingface';
import {
  MetadataFilter,
  NodeRelationship,
  Settings,
  SimpleVectorStore,
  StorageContext,
  storageContextFromDefaults,
  TextNode,
  VectorStoreIndex,
} from 'llamaindex';
import path from 'path';
import * as vscode from 'vscode';

import { DbFile, FileChunk, getWorkspaceName } from '../../utils';
Settings.embedModel = new HuggingFaceEmbedding({ modelType: 'BAAI/bge-small-en-v1.5' });

export class VectorizerClient {
  private storagePath: string;
  private storageContext!: StorageContext;
  private index!: VectorStoreIndex;
  private parent!: TextNode;
  private storage!: SimpleVectorStore;

  constructor(private context: vscode.ExtensionContext) {
    this.storagePath = path.join(context?.globalStorageUri?.fsPath, 'vectors-storage-index');
  }

  async init() {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(this.storagePath));
    this.storage = await SimpleVectorStore.fromPersistDir(this.storagePath);

    this.storageContext = await storageContextFromDefaults({
      persistDir: this.storagePath,
      vectorStore: this.storage,
    });

    try {
      this.index = await VectorStoreIndex.init({ storageContext: this.storageContext });

      console.log('Loaded existing index from storage');
    } catch (err) {
      console.log('Creating new ');
      const metadata = { path: '', workspace: getWorkspaceName(), parent: 'root' };
      this.parent = new TextNode({ text: '', metadata });
      this.index = await VectorStoreIndex.fromDocuments([this.parent], {
        storageContext: this.storageContext,
      });
      console.log(err);
    }
  }

  async isWorkspaceIndexed() {
    const queryEngine = this.index.asRetriever({
      filters: { filters: [{ key: 'workspace', value: getWorkspaceName(), operator: '==' }] },
      similarityTopK: 10,
    });

    const response = await queryEngine.retrieve({ query: '*' });
    const data = response.map((el) => {
      return el.node;
    });

    return false;
  }

  async indexFiles(chunks: DbFile[]) {
    const filesMap = chunks.reduce(
      (acc, chunk) => {
        if (!acc[chunk.path]) {
          acc[chunk.path] = [];
        }
        acc[chunk.path].push(chunk);
        return acc;
      },
      {} as { [key: string]: DbFile[] },
    );

    const paths = Object.keys(filesMap);
    await this.deleteFiles(paths);
    let documents: TextNode[] = [];

    for (const entrie of Object.entries(filesMap)) {
      const [path, chunks] = entrie;

      const parent = new TextNode({
        text: '',
        metadata: { path, workspace: getWorkspaceName(), parent: 'root' },
      });
      const metadata = { path, workspace: getWorkspaceName(), parent: parent.id_ };
      const relationships = {
        [NodeRelationship.SOURCE]: { nodeId: parent.id_, metadata },
      };
      const nodes = chunks.map(
        (chunk) =>
          new TextNode({
            text: chunk.text,
            relationships,
            endCharIdx: chunk.endLine,
            startCharIdx: chunk.startLine,
            metadata,
          }),
      );

      documents = nodes.concat(parent);
    }

    await this.index.insertNodes(documents);
  }

  async deleteFiles(paths: string[]) {
    const queryEngine = this.index.asRetriever({
      filters: {
        filters: [
          { key: 'workspace', value: getWorkspaceName(), operator: '==' },
          { key: 'path', value: paths, operator: 'in' },
        ],
      },
      similarityTopK: 0,
    });

    const chunks = await queryEngine.retrieve({ query: ' ' });

    return Promise.all(
      chunks.map((el) => {
        return this.storage.delete(el.node.metadata.parent);
      }),
    );
  }

  async searchKNN(
    search: string,
    filters?: { workspace: string; path?: string },
    similarityTopK = 5,
  ): Promise<FileChunk[]> {
    const filter: Array<MetadataFilter> = [
      { key: 'workspace', value: filters?.workspace ?? getWorkspaceName(), operator: '==' },
    ];
    if (filters?.path) {
      filter.push({ key: 'path', value: filters.path, operator: 'in' });
    }
    const queryEngine = this.index.asRetriever({
      filters: { filters: filter },
      similarityTopK,
    });

    const response = await queryEngine.retrieve({
      query: search,
    });

    return response.map((el) => ({
      path: el.node.metadata.path,
      text: el.node.text,
      workspace: el.node.metadata.workspace,
      startLine: el.node.startCharIdx,
      endLine: el.node.endCharIdx,
      id: el.node.id_,
      type: el.node.metadata.type,
    }));
  }
}
