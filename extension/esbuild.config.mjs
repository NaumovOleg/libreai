import esbuildPluginTsc from 'esbuild-plugin-tsc';
import path from 'path';
import fs from 'fs';
import { build } from 'esbuild';

function getAllDependencies(pkgName) {
  const pkgPath = path.resolve(`../node_modules/${pkgName}/package.json`);
  if (!fs.existsSync(pkgPath)) return [];

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = Object.keys(pkg.dependencies || {});
  const subDeps = deps.flatMap(getAllDependencies);
  return [pkgName, ...subDeps];
}

const externals = [
  ...getAllDependencies('@xenova/transformers'),
  ...getAllDependencies('onnxruntime-node'),
];

const vscodeignorePath = path.resolve('../.vscodeignore');

let baseIgnore = `**/*
!out
!package.json
!yarn.lock
!media/*
!LICENSE.md
!README.md
!node_modules/@lancedb/lancedb-darwin-arm64/**
`;

const includeLines = externals.map((pkg) => `!node_modules/${pkg}/**`);
const finalContent = `${baseIgnore}\n${includeLines.join('\n')}\n`;

fs.writeFileSync(vscodeignorePath, finalContent);

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
    ...externals,
    '@lancedb/lancedb-darwin-arm64',
    // 'js-tiktoken',
    // 'base64-js',
    // 'magic-bytes.js',
    // 'zod',
    // '@finom',
    // 'openai',
    // 'ollama',
    // 'whatwg-fetch',
    // 'onnxruntime-web',
    // '@huggingface/jinja',
    // 'sharp',
    // 'onnxruntime-common',
    // 'semver',
    // 'detect-libc',
  ],
  sourcemap: false,
}).catch((err) => {
  console.error(err);
});
