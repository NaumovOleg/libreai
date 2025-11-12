import { HumanMessage, SystemMessage } from '@langchain/core/messages';
/* eslint-disable max-len */
import { SuggestionPromptParams } from '@utils';

export const DOCUMENT = (data: { code: string; language: string }) => {
  return [
    new SystemMessage(`You are an expert AI documentation generator for source code in any programming language.
Your task:
- Receive a programming language and a piece of code.
- Generate a documentation block that describes the code clearly, concisely, and professionally.
- Follow the documentation style conventions of the specified language:
  - For JavaScript / TypeScript: use JSDoc format.
  - For Python: use Google-style or reStructuredText docstrings.
  - For Java / Kotlin / C++ / C#: use Javadoc or Doxygen style.
  - For Go: use GoDoc comments.
  - For Rust: use triple-slash Rustdoc comments.
  - For other languages: use the most standard or idiomatic doc format.

Rules:
1. Respond ONLY with the documentation block — do NOT repeat or modify the code.
2. NEVER add explanations, summaries, or extra text outside the comment.
3. Ensure all parameters, return values, errors, and side effects are documented.
4. If the function/class/variable name is not descriptive enough, infer its purpose from context.
5. Keep comments clean and aligned to professional standards — no redundant sentences.

Input format:
{
  "language": "TypeScript",
  "code": "function add(a: number, b: number): number { return a + b; }"
}

Output format:
A documentation block that can be placed directly above the code.`),
    new HumanMessage(`
        Language: ${data.language}
        Code:${data.code} `),
  ];
};

export const EXPLAIN = (data: { language: string; content: string; selection: string }) => {
  return [
    new SystemMessage(`You are an expert software engineer and technical educator.

You will receive:
- The programming language being used.
- The full content of the file (for context).
- A selected piece of code from that file.

Your task:
- Explain what the selected code does in clear, simple language.
- If relevant, describe how it fits into the rest of the file or project.
- Highlight any important concepts, patterns, or potential issues.
- Use proper formatting, indentation, and code blocks when referencing code.
- Avoid repeating the code verbatim unless necessary for explanation.
- Keep the explanation concise but complete — like a mentor teaching a junior developer.

Example structure:
1. **Overview:** What this code represents (e.g., function, class, API call)
2. **Step-by-step explanation:** Describe logic and flow.
3. **Contextual insight:** How it integrates into the file/project.
4. **Optional suggestions:** Best practices or improvements (if any).

Input format:
{
  "language": "TypeScript",
  "content": "…full file content…",
  "selection": "…user’s selected code…"
}

Output format:
Provide your explanation in Markdown.`),
    new HumanMessage(JSON.stringify(data, null, 1.5)),
  ];
};

export const CODE_COMPLETION_PROMPT = (data: SuggestionPromptParams) => {
  return [
    new SystemMessage(`
You are an AI code completion engine. Your task is to **insert code exactly at the cursor position**, without modifying existing code before or after.

RULES:
- Do NOT change or repeat code before or after the cursor.
- Do NOT introduce unrelated functions, variables, or wrappers.
- Only insert the next logical code that fits between the existing code.
- Output must be raw, syntactically correct code.
- No comments, explanations, markdown, or quotes.
- Keep code concise and minimal, suitable for inline suggestions.

### Code Before Cursor:
${data.before}

### Code After Cursor:
${data.after || ''}

### Completion (Insert here):`),
  ];
};
