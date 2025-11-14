/* eslint-disable max-len */
import { SupportedTextSplitterLanguage } from '@langchain/textsplitters';
export const filePattern =
  '**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,py,pyw,pyi,rpy,pyx,pyd,md,markdown,mdown,mkd,mkdn,json,html,htm,xhtml,shtml,scss,css,cpp,cc,cxx,hpp,hh,hxx,h,ino,go,java,php,phtml,php3,php4,php5,phps,proto,rst,rb,erb,gemspec,rake,rs,scala,sc,swift,tex,ltx,sty,cls,sol}';
export const foldersPattern = `{**/node_modules/**,**/dist/**,**/build/**,**/out/**,**/.vscode/**,**/.idea/**,**/.vs/**,**/.venv/**,**/venv/**,**/env/**,**/__pycache__/**,**/target/**,**/bin/**,**/obj/**,**/coverage/**,**/.nyc_output/**,**/.next/**,**/.nuxt/**,**/.svelte-kit/**,**/.expo/**,**/.gradle/**,**/.git/**,**/.hg/**,**/.svn/**,**/.cache/**,**/.parcel-cache/**,**/.tmp/**,**/tmp/**,**/logs/**,**/package-lock.json,**/yarn.lock,**/pnpm-lock.yaml,**/README.md,**/LICENSE,**/CHANGELOG.md,**/workspace.json,**/settings.json,**/.DS_Store,**/.env,**/.env.*,**/LICENSE.md,**/cdk.out}`;

export const EXCLUDED_FOLDERS = [
  'node_modules',
  'dist',
  'build',
  'out',
  '.vscode',
  '.idea',
  '.vs',
  '.venv',
  'venv',
  'env',
  '__pycache__',
  'target',
  'bin',
  'obj',
  'coverage',
  '.nyc_output',
  '.next',
  '.nuxt',
  '.svelte-kit',
  '.expo',
  '.gradle',
  '.git',
  '.hg',
  '.svn',
  '.DS_Store',
  '.cache',
  '.parcel-cache',
  '.tmp',
  'tmp',
  'logs',
  'package-lock.json',
  'yarn-lock.json',
  'README.md',
  'cdk.out',
  'cdk.json',
  '**/.cache/**',
  '**/.parcel-cache/**',
  '**/.tmp/**',
  '**/tmp/**',
  '**/logs/**',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/README.md',
  '**/LICENSE',
  '**/CHANGELOG.md',
  '**/workspace.json',
  '**/settings.json',
  '**/.DS_Store',
  '**/.env',
  '**/.env.*',
  '**/LICENSE.md',
  '**/cdk.out',
];

export const DECLINED_COMMAND_MESSAGE = 'Declined by user';

export const EXTENSION_TO_LANGUAGE: Record<string, SupportedTextSplitterLanguage | 'ts'> = {
  // HTML
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  shtml: 'html',

  // C++
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
  h: 'cpp',
  ino: 'cpp',

  // Go
  go: 'go',

  // Java
  java: 'java',

  // JavaScript
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'js',

  // TypeScript
  ts: 'ts',
  mts: 'ts',
  cts: 'ts',
  tsx: 'ts',

  // PHP
  php: 'php',
  phtml: 'php',
  php3: 'php',
  php4: 'php',
  php5: 'php',
  phps: 'php',

  // Protobuf
  proto: 'proto',

  // Python
  py: 'python',
  pyw: 'python',
  pyi: 'python',
  rpy: 'python',
  pyx: 'python',
  pyd: 'python',

  // reStructuredText
  rst: 'rst',

  // Ruby
  rb: 'ruby',
  erb: 'ruby',
  gemspec: 'ruby',
  rake: 'ruby',

  // Rust
  rs: 'rust',

  // Scala
  scala: 'scala',
  sc: 'scala',

  // Swift
  swift: 'swift',

  // Markdown
  md: 'markdown',
  markdown: 'markdown',
  mdown: 'markdown',
  mkd: 'markdown',
  mkdn: 'markdown',

  // LaTeX
  tex: 'latex',
  ltx: 'latex',
  sty: 'latex',
  cls: 'latex',

  // Solidity
  sol: 'sol',
};
