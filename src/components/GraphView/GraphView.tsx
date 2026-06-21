import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { Popover } from '../NodePopover';
import { useExplorer } from '../../state/ExplorerContext';
import { degreeMap, neighborIds } from '../../utils/graph';
import { useForceLayout, type LayoutNode } from './useForceLayout';

const palette = ['var(--nge-accent-teal)', 'var(--nge-accent-amber)', 'var(--nge-success)', 'var(--nge-warning)', 'var(--nge-error)'];
const hash = (value: string) => [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);

interface Props { width: number; height: number; onFitHandler?: (handler: () => void) => void }

export function GraphView({ width, height, onFitHandler }: Props) {
  const { data, selectedNodeId, setSelectedNodeId, selectedEdgeId, setSelectedEdgeId, relationshipConfig, nodeTypeColors, onEdgeDelete } = useExplorer();
  const { nodes, edges, beginDrag, dragNode, endDrag } = useForceLayout(data.nodes, data.edges, width, height);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1, animate: false });
  const draggingNode = useRef<string | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const degrees = useMemo(() => degreeMap(data.nodes, data.edges), [data]);
  const neighbors = useMemo(() => selectedNodeId ? neighborIds(selectedNodeId, data.edges) : new Set<string>(), [data.edges, selectedNodeId]);

  const fit = () => {
    if (!nodes.length) return setTransform({ x: 0, y: 0, k: 1, animate: true });
    const xs = nodes.map((node) => node.x); const ys = nodes.map((node) => node.y);
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    const k = Math.min(1.5, Math.max(0.25, Math.min((width - 80) / Math.max(1, maxX - minX), (height - 80) / Math.max(1, maxY - minY))));
    setTransform({ k, x: width / 2 - ((minX + maxX) / 2) * k, y: height / 2 - ((minY + maxY) / 2) * k, animate: true });
  };
  useEffect(() => { onFitHandler?.(fit); });

  const activate = (id: string, recenter = false) => {
    setSelectedEdgeId(null); setSelectedNodeId(id);
    if (recenter) {
      const node = nodes.find((item) => item.id === id);
      if (node) setTransform((current) => ({ ...current, x: width / 2 - node.x * current.k, y: height / 2 - node.y * current.k, animate: true }));
    }
  };
  const directionalNeighbor = (node: LayoutNode, key: string) => {
    const ids = neighborIds(node.id, data.edges);
    const candidates = nodes.filter((candidate) => ids.has(candidate.id));
    const vector = key === 'ArrowLeft' ? [-1, 0] : key === 'ArrowRight' ? [1, 0] : key === 'ArrowUp' ? [0, -1] : [0, 1];
    return candidates.map((candidate) => {
      const dx = candidate.x - node.x; const dy = candidate.y - node.y; const distance = Math.hypot(dx, dy) || 1;
      return { candidate, score: (dx * vector[0] + dy * vector[1]) / distance - distance * 0.0001 };
    }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score)[0]?.candidate;
  };
  const onNodeKeyDown = (event: KeyboardEvent<SVGGElement>, node: LayoutNode) => {
    if (event.key.startsWith('Arrow')) { event.preventDefault(); const next = directionalNeighbor(node, event.key); if (next) activate(next.id, true); }
    if ((event.key === 'Enter' || event.key === ' ') && selectedNodeId !== node.id) { event.preventDefault(); activate(node.id); }
  };
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { x: px, y: py } = graphPoint(svg, event.clientX, event.clientY, width, height);
      setTransform((current) => {
        const k = Math.min(3, Math.max(0.25, current.k * Math.exp(-event.deltaY * 0.001)));
        return { k, x: px - ((px - current.x) / current.k) * k, y: py - ((py - current.y) / current.k) * k, animate: false };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [width, height]);
  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const point = graphPoint(event.currentTarget, event.clientX, event.clientY, width, height);
    const activePan = pan.current;
    if (activePan) setTransform((current) => ({ ...current, x: activePan.tx + point.x - activePan.x, y: activePan.ty + point.y - activePan.y, animate: false }));
    if (draggingNode.current) dragNode(draggingNode.current, (point.x - transform.x) / transform.k, (point.y - transform.y) / transform.k);
  };
  const stopPointer = () => { if (draggingNode.current) endDrag(draggingNode.current); draggingNode.current = null; pan.current = null; };

  return (
    <div className="nge-graph-wrap">
      <svg ref={svgRef} className="nge-graph" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-label="Node graph"
        onPointerDown={(event) => { if (event.target === event.currentTarget) { const point = graphPoint(event.currentTarget, event.clientX, event.clientY, width, height); pan.current = { x: point.x, y: point.y, tx: transform.x, ty: transform.y }; setTransform((current) => ({ ...current, animate: false })); setSelectedNodeId(null); setSelectedEdgeId(null); event.currentTarget.setPointerCapture(event.pointerId); } }}
        onPointerMove={onPointerMove} onPointerUp={stopPointer} onPointerCancel={stopPointer}
        onKeyDown={(event) => { if (event.key === 'Delete' && selectedEdgeId && onEdgeDelete) { onEdgeDelete(selectedEdgeId); setSelectedEdgeId(null); } }}>
        <defs>{Object.entries(relationshipConfig).map(([type, config]) => <marker key={type} id={`nge-arrow-${hash(type)}`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={config.color} /></marker>)}</defs>
        <g className={`nge-viewport${transform.animate ? ' is-animated' : ''}`} transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
          {edges.map((edge) => { const config = relationshipConfig[edge.type]; const active = selectedEdgeId === edge.id || selectedNodeId === edge.source.id || selectedNodeId === edge.target.id; const dim = Boolean(selectedNodeId) && !active; return <line key={edge.id} role="button" tabIndex={0} aria-label={`${edge.type}: ${edge.source.label} to ${edge.target.label}`} x1={edge.source.x} y1={edge.source.y} x2={edge.target.x} y2={edge.target.y} className={`nge-edge${active ? ' is-active' : ''}${dim ? ' is-dimmed' : ''}`} stroke={config?.color ?? palette[hash(edge.type) % palette.length]} strokeDasharray={config?.style === 'dashed' ? '7 5' : undefined} markerEnd={(edge.directional ?? config?.directional) ? `url(#nge-arrow-${hash(edge.type)})` : undefined} onClick={(event) => { event.stopPropagation(); setSelectedNodeId(null); setSelectedEdgeId(edge.id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedNodeId(null); setSelectedEdgeId(edge.id); } }} />; })}
          {nodes.map((node) => { const selected = selectedNodeId === node.id; const connected = neighbors.has(node.id); const dim = Boolean(selectedNodeId) && !selected && !connected; const radius = 9 + Math.min(9, Math.sqrt(degrees.get(node.id) ?? 0) * 3); const content = <g key={node.id} role="button" tabIndex={0} aria-label={`${node.label}${node.type ? `, ${node.type}` : ''}`} className={`nge-node${selected ? ' is-selected' : ''}${connected ? ' is-connected' : ''}${dim ? ' is-dimmed' : ''}`} onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) activate(node.id); }} onKeyDown={(event) => onNodeKeyDown(event, node)} onClick={(event) => { event.stopPropagation(); activate(node.id); }} onPointerDown={(event) => { event.stopPropagation(); draggingNode.current = node.id; beginDrag(node.id); setTransform((current) => ({ ...current, animate: false })); (event.currentTarget.ownerSVGElement)?.setPointerCapture(event.pointerId); }}><circle cx={node.x} cy={node.y} r={radius} fill={node.color ?? (node.type && nodeTypeColors[node.type]) ?? palette[hash(node.type ?? node.id) % palette.length]} /><text x={node.x} y={node.y + radius + 16} textAnchor="middle">{node.label}</text></g>; return selected ? <Popover.Anchor asChild key={node.id}>{content}</Popover.Anchor> : content; })}
        </g>
      </svg>
      <div className="nge-zoom-controls" aria-label="Graph controls">
        <button type="button" aria-label="Zoom in" onClick={() => setTransform((v) => ({ ...v, k: Math.min(3, v.k * 1.25), animate: true }))}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setTransform((v) => ({ ...v, k: Math.max(.25, v.k / 1.25), animate: true }))}>−</button>
        <button type="button" aria-label="Fit graph" onClick={fit}>⌾</button>
      </div>
    </div>
  );
}

export function graphPoint(svg: SVGSVGElement, clientX: number, clientY: number, width: number, height: number) {
  const rect = svg.getBoundingClientRect();
  return { x: (clientX - rect.left) * width / Math.max(rect.width, 1), y: (clientY - rect.top) * height / Math.max(rect.height, 1) };
}
