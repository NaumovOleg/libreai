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
