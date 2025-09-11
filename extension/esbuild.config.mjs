import { build } from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

build({
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  platform: 'node',
  outfile: '../out/extension.js',
  target: 'esnext',
  format: 'cjs', // VSCode expects CJS
  loader: { '.ts': 'ts' },
  plugins: [esbuildPluginTsc()],
  external: [
    'vscode',
    '@xenova/transformers', // external to avoid dynamic require issues
    'onnxruntime-node',
    'sharp',
    '@lancedb/lancedb',
  ],
  sourcemap: true,
}).catch((err) => {
  console.error(err);
});
