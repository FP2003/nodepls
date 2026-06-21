import { describe, expect, it } from 'vitest';
import { buildTree } from './tree';

describe('buildTree', () => {
  it('normalizes paths, honors parentId, and groups orphaned nodes', () => {
    const tree = buildTree([
      { id: 'a', label: 'A', path: 'Docs\\A' },
      { id: 'b', label: 'B', parentId: 'a', path: 'Ignored/B' },
      { id: 'c', label: 'C', parentId: 'missing' },
      { id: 'd', label: 'D' },
    ]);
    expect(tree.folders.find((item) => item.label === 'Docs')?.nodes.map((node) => node.id)).toEqual(['a']);
    expect(tree.folders.find((item) => item.label === 'Docs')?.folders[0].nodes[0].id).toBe('b');
    expect(tree.folders.find((item) => item.label === 'Unfiled')?.nodes.map((node) => node.id)).toEqual(['c', 'd']);
  });
});
