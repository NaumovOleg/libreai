import { z } from 'zod';

export const file = z.string().describe('Full path to the file');
export const content = z.string().describe('Content for insert to file.');
export const command = z.string().describe('Command to  execute.');
export const newName = z.string().describe('New name of file');

// const startLine = z
//   .number()
//   .describe('Starting line number (0-indexed). !!!IMPORTANT: calculate this param very precise.');
// const endLine = z
//   .number()
//   .describe('Ending line number (0-indexed). !!!IMPORTANT: calculate this param very precise.');
// const insertMode = z.enum(['insert', 'replace', 'delete']).describe(`Operation mode.

// `);
