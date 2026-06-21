import type { EdgeData, GraphData, NodeData } from '../types';

export function validateGraph(data: GraphData): string[] {
  const errors: string[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const tuples = new Set<string>();
  for (const node of data.nodes) {
    if (nodeIds.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    nodeIds.add(node.id);
  }
  for (const edge of data.edges) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge id: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source)) errors.push(`Unknown source node: ${edge.source}`);
    if (!nodeIds.has(edge.target)) errors.push(`Unknown target node: ${edge.target}`);
    const tuple = `${edge.source}\u0000${edge.target}\u0000${edge.type}`;
    if (tuples.has(tuple)) errors.push(`Duplicate relationship: ${edge.source} → ${edge.target} (${edge.type})`);
    tuples.add(tuple);
  }
  return errors;
}

export function degreeMap(nodes: NodeData[], edges: EdgeData[]) {
  const degrees = new Map(nodes.map((node) => [node.id, 0]));
  edges.forEach((edge) => {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    if (edge.target !== edge.source) degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
  });
  return degrees;
}

export function neighborIds(nodeId: string, edges: EdgeData[]) {
  const result = new Set<string>();
  edges.forEach((edge) => {
    if (edge.source === nodeId) result.add(edge.target);
    if (edge.target === nodeId) result.add(edge.source);
  });
  return result;
}
