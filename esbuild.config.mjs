import { build } from 'esbuild';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

build({
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  minify: true,
  platform: 'node',
  sourcemap: false,
  // target: 'node20',
  outdir: './out',
  entryNames: '[name]',
  target: 'esnext',
  format: 'cjs',
  loader: { '.ts': 'ts' },
  plugins: [esbuildPluginTsc()],
  external: ['vscode'],
  //   external: ['mock-aws-s3', '@mapbox'],
}).catch((_err) => {
  process.exit(1);
});
