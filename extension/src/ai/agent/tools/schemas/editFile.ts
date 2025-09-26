/* eslint-disable max-len */
import { z } from 'zod';
const file = z.string().describe('Full path to the file. Ommited for "command"');
const startLine = z
  .number()
  .describe(
    'Starting line number (0-indexed). Ommited for "renaemFile", "renaemFile". !!!IMPORTANT: calculate this param very precise.',
  );
const endLine = z
  .number()
  .describe(
    'Ending line number (0-indexed). Ommited for "renaemFile", "renaemFile". !!!IMPORTANT: calculate this param very precise.',
  );
const insertMode = z.enum(['insert', 'replace', 'delete'])
  .describe(`Operation mode. Ommited for "renaemFile", "renaemFile" 
"insertMode" logic:
- "insert":
  - startLine and endLine MUST be equal.
  - The code snippet will be inserted **AFTER** the specified startLine content.
  - All existing content below will be shifted down by the number of lines in the snippet.
  - Use ONLY to add code after a line content.
- "replace":
  - The lines from startLine (inclusive) to endLine (inclusive) are replaced with the snippet.
  - The snippet should have the same or different number of lines; replaced content is removed entirely.
  - Use ONLY to replace lines
- "delete":
  - The lines from startLine (inclusive) to endLine (inclusive) are **deleted**.
  - "content" must be an empty string.
  - Use ONLY to remove lines.`);
const content = z.string().describe('Content for insert/replace.');

export const EditFileSchema = z.object({ file, startLine, endLine, insertMode, content }).describe(
  `*** TOOL INPUT RULES ***
1. The "content" field must contain ONLY the exact code snippet to insert or replace.
   - Escape special characters (\\n, quotes, etc.).
   - MUST be empty if insertMode = "delete".

2. Calculate correct line numbers (startLine and endLine) based on the file content.
   - startLine (0-based): first affected line.
   - endLine (0-based): last affected line.
   - Both inclusive.
   - If startLine = endLine, only that line is affected.

3. insertMode logic:
   - "insert": startLine and endLine MUST be equal; snippet is inserted AFTER that line.
   - "replace": lines from startLine..endLine are replaced with the snippet.
   - "delete": lines from startLine..endLine are deleted; "content" MUST be empty.
   - Do NOT invent any other values (like "append", "add", "update")
   
   ***Read content carefully and make very precise calculation of "startLine" and "endLine"`,
);
