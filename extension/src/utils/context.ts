import * as vscode from 'vscode';

export async function gatherWorkspaceContext(
  maxFiles: number,
  maxChars: number,
  query?: string,
): Promise<string> {
  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.py',
    '**/*.go',
    '**/*.java',
    '**/*.rs',
    '**/*.cs',
    '**/*.json',
    '**/*.md',
  ];

  const uris: vscode.Uri[] = [];

  for (const pattern of patterns) {
    const found = await vscode.workspace.findFiles(pattern, '**/node_modules/**', maxFiles * 3);
    for (const f of found) {
      uris.push(f);
      if (uris.length >= maxFiles * 3) break;
    }
    if (uris.length >= maxFiles * 3) break;
  }
  const ranked = await Promise.all(
    uris.map(async (u) => {
      try {
        const stat = await vscode.workspace.fs.stat(u);
        const name = u.path.split('/').pop() || '';
        const score =
          (query && name.toLowerCase().includes(query.toLowerCase()) ? 10 : 0) -
          Math.log(stat.size + 1);
        return { uri: u, score };
      } catch {
        return { uri: u, score: -Infinity };
      }
    }),
  );

  ranked.sort((a, b) => b.score - a.score);
  const selected = ranked.slice(0, Math.max(1, maxFiles)).map((r) => r.uri);

  let combined = '';
  for (const u of selected) {
    try {
      const bytes = await vscode.workspace.fs.readFile(u);
      const text = new TextDecoder('utf-8').decode(bytes);
      combined +=
        `\n===== FILE: ${u.path.split('/').pop()} =====\n` +
        text.substring(0, Math.floor(maxChars / selected.length));
      if (combined.length >= maxChars) break;
    } catch {
      continue;
    }
  }

  return combined.substring(0, maxChars);
}
