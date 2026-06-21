import { describe, expect, it } from 'vitest';
import { degreeMap, neighborIds, validateGraph } from './graph';

describe('graph utilities', () => {
  const nodes = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
  it('reports invalid endpoints, duplicate ids, and duplicate directed relationships', () => {
    expect(validateGraph({ nodes, edges: [
      { id: 'e', source: 'a', target: 'b', type: 'x' },
      { id: 'e', source: 'a', target: 'b', type: 'x' },
      { id: 'z', source: 'missing', target: 'a', type: 'x' },
    ] })).toEqual(expect.arrayContaining([
      'Duplicate edge id: e', 'Duplicate relationship: a → b (x)', 'Unknown source node: missing',
    ]));
  });
  it('allows reverse and self relationships and calculates degree', () => {
    const edges = [
      { id: '1', source: 'a', target: 'b', type: 'x' },
      { id: '2', source: 'b', target: 'a', type: 'x' },
      { id: '3', source: 'a', target: 'a', type: 'self' },
    ];
    expect(validateGraph({ nodes, edges })).toEqual([]);
    expect(degreeMap(nodes, edges).get('a')).toBe(3);
    expect(neighborIds('a', edges)).toEqual(new Set(['a', 'b']));
  });
});
