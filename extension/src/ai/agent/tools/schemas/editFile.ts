import { z } from 'zod';

const file = z
  .string()
  .min(1, 'File path cannot be empty')
  .describe('Full absolute path to the file being edited.');

const content = z.string().min(1, 'Content cannot be empty').describe(`
***COMPLETE FILE CONTENT*** - Return the ENTIRE corrected file content.

CRITICAL RULES:
- Include ALL content from the original file with corrections applied
- Preserve original formatting, indentation, and code style
- Ensure syntax correctness for the file type
- Include all imports, comments, and structure
- Do NOT return only changes - return the complete file`);

export const EditFileSchema = z.object({
  file,
  content,
}).describe(`***COMPLETE FILE REPLACEMENT***

Replaces the entire file content with the corrected version.

IMPORTANT:
- You MUST call "readFile" first to get current content
- Return the WHOLE file, not just changes
- Preserve file encoding and line endings`);

console.log(JSON.stringify(EditFileSchema));
