import fs from 'node:fs/promises';

import { HuggingFaceEmbedding } from '@llamaindex/huggingface';
import { Document, Settings, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex';

console.log(storageContextFromDefaults);

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: 'BAAI/bge-small-en-v1.5',
});

async function main() {
  const dbpath =
    '/Users/oleg/Library/Application Support/Code/User/globalStorage/olegnaumov.libreai';
  console.log('-----------------------------');
  // Load essay from abramov.txt in Node
  const url = '/Users/oleg/Documents/projects/aiert/extension/src/extension.ts';

  const text = await fs.readFile(url, 'utf-8');
  const document = new Document({
    text: text,
    id_: url,
    metadata: {
      workspace: 'dddda',
      file: 'sssss',
    },
  });
  console.log('+++===++++++++==+++++++', document);
  const storageContext = await storageContextFromDefaults({
    persistDir: dbpath + '/llamastorage',
  });

  const index = await VectorStoreIndex.fromDocuments([document], {
    storageContext,
  });

  console.log(index);

  // Query the index
  const queryEngine = index.asRetriever({
    filters: {
      filters: [{ key: 'workspace', value: 'dddda', operator: '==' }],
    },
  });

  const response = await queryEngine.retrieve({
    query: 'What did the author do in college?',
  });

  // Output response
  console.log('======s=s=s=s=s==s=s=s=s=s=s=s=s=', response);
}

main().catch(console.error);
