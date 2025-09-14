import { isValidElement, ReactNode } from 'react';
import { visit } from 'unist-util-visit';
export const uuid = (length: number = 4): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

export const extractTextFromNode = (node: ReactNode): string => {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromNode).join('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isValidElement(node)) return extractTextFromNode((node.props as any).children);
  return '';
};

export const rehypeCodeIndexPlugin = () => {
  return (tree: unknown) => {
    let index = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'code') {
        node.properties = node.properties || {};
        node.properties['dataCodeIndex'] = index;
        index++;
      }
    });
  };
};

export function rehypeLineNumbers() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'code' && node.children && node.children.length) {
        const textNode = node.children[0];
        if (!textNode || !textNode.value) return;

        const lines = textNode.value.split('\n');
        const numbered = lines
          .map((line: string, index: number) => {
            return `<span class="line"><span class="line-number">${index + 1}</span>${line}</span>`;
          })
          .join('\n');

        node.children = [{ type: 'raw', value: numbered }];
        node.properties.className = (node.properties.className || []).concat('line-numbers');
      }
    });
  };
}
