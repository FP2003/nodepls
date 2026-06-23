import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EdgeData, NodeData } from '../../types';

export interface LayoutNode extends SimulationNodeDatum, NodeData { x: number; y: number }
export interface LayoutEdge extends SimulationLinkDatum<LayoutNode> { id: string; source: LayoutNode; target: LayoutNode; type: string; label?: string; directional?: boolean }

// Before d3 resolves references, source/target are still string IDs.
type MutableLayoutEdge = Omit<LayoutEdge, 'source' | 'target'> & SimulationLinkDatum<LayoutNode>;

export function useForceLayout(nodes: NodeData[], edges: EdgeData[], width: number, height: number) {
  const [layout, setLayout] = useState<{ nodes: LayoutNode[]; edges: LayoutEdge[] }>({ nodes: [], edges: [] });
  const simulationRef = useRef<ReturnType<typeof forceSimulation<LayoutNode>> | null>(null);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const layoutRef = useRef(layout);

  const nodeSignature = useMemo(() => nodes.map((n) => n.id).join(','), [nodes]);
  const edgeSignature = useMemo(
    () => edges.map((e) => `${e.id}:${e.source}:${e.target}:${e.type}`).join(','),
    [edges],
  );

  useEffect(() => {
    const nextNodes = nodes.map((node, index) => {
      const previous = positionsRef.current.get(node.id);
      const angle = (index / Math.max(nodes.length, 1)) * Math.PI * 2;
      return { ...node, x: previous?.x ?? width / 2 + Math.cos(angle) * 80, y: previous?.y ?? height / 2 + Math.sin(angle) * 80 };
    }) as LayoutNode[];
    const known = new Set(nodes.map((node) => node.id));
    const nextEdges = edges
      .filter((edge) => known.has(edge.source) && known.has(edge.target))
      .map((edge) => ({ ...edge })) as MutableLayoutEdge[];
    const publish = () => {
      nextNodes.forEach((node) => positionsRef.current.set(node.id, { x: node.x, y: node.y }));
      // d3 has resolved source/target to node objects by the time tick fires.
      const next = { nodes: [...nextNodes], edges: nextEdges as unknown as LayoutEdge[] };
      layoutRef.current = next;
      setLayout(next);
    };
    const simulation = forceSimulation(nextNodes)
      .force('link', forceLink<LayoutNode, MutableLayoutEdge>(nextEdges).id((node) => node.id).distance(95).strength(0.55))
      .force('charge', forceManyBody().strength(-260))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<LayoutNode>().radius(32))
      .alphaDecay(0.045)
      .on('tick', publish);
    simulationRef.current = simulation;
    publish();
    return () => { simulation.stop(); if (simulationRef.current === simulation) simulationRef.current = null; };
    // Signatures are stable proxies for nodes/edges that prevent restarting the simulation
    // when the consumer recreates equivalent arrays with new object references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeSignature, edgeSignature, width, height]);

  const beginDrag = useCallback((id: string) => {
    const node = layoutRef.current.nodes.find((item) => item.id === id);
    if (node) { node.fx = node.x; node.fy = node.y; simulationRef.current?.alphaTarget(0.22).restart(); }
  }, []);
  const dragNode = useCallback((id: string, x: number, y: number) => {
    const node = layoutRef.current.nodes.find((item) => item.id === id);
    if (!node) return;
    node.x = x; node.y = y; node.fx = x; node.fy = y;
    positionsRef.current.set(id, { x, y });
    setLayout((current) => ({ ...current, nodes: [...current.nodes] }));
  }, []);
  const endDrag = useCallback((id: string) => {
    const node = layoutRef.current.nodes.find((item) => item.id === id);
    if (node) { node.fx = null; node.fy = null; }
    simulationRef.current?.alphaTarget(0);
  }, []);
  return { ...layout, beginDrag, dragNode, endDrag };
}
