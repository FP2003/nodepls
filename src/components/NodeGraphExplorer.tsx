import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ExplorerProvider } from '../state/ExplorerContext';
import { useControllableState } from '../hooks/useControllableState';
import { useResolvedTheme } from '../hooks/useResolvedTheme';
import { validateGraph } from '../utils/graph';
import type { NodeGraphExplorerProps, RelationshipConfig } from '../types';
import { Toolbar } from './controls/Toolbar';
import { GraphView } from './GraphView/GraphView';
import { FileExplorerView } from './FileExplorerView/FileExplorerView';
import { NodePopoverContent } from './NodePopover';
import { RelationshipEditor } from './RelationshipEditor';

const defaultRelationships: RelationshipConfig = {
  references: { color: 'var(--nge-accent-teal)', directional: true },
  related: { color: 'var(--nge-accent-amber)' },
};

export function NodeGraphExplorer(props: NodeGraphExplorerProps) {
  const [selectedNodeId, setSelectedNodeId] = useControllableState(props.selectedNodeId, props.defaultSelectedNodeId ?? null, props.onSelectedNodeChange);
  const [viewMode, setViewMode] = useControllableState(props.viewMode, props.defaultViewMode ?? 'graph', props.onViewModeChange);
  const [theme, setTheme] = useControllableState(props.theme, props.defaultTheme ?? 'system', props.onThemeChange);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const resolvedTheme = useResolvedTheme(theme);
  const relationshipConfig = useMemo(() => ({ ...defaultRelationships, ...props.relationshipConfig }), [props.relationshipConfig]);
  const errors = useMemo(() => validateGraph(props.data), [props.data]);
  useEffect(() => { if (selectedNodeId && !props.data.nodes.some((node) => node.id === selectedNodeId)) setSelectedNodeId(null); }, [props.data.nodes, selectedNodeId, setSelectedNodeId]);
  useEffect(() => { if (selectedEdgeId && !props.data.edges.some((edge) => edge.id === selectedEdgeId)) setSelectedEdgeId(null); }, [props.data.edges, selectedEdgeId]);
  const width = typeof props.width === 'number' ? props.width : 900;
  const height = typeof props.height === 'number' ? props.height : 600;
  const value = useMemo(() => ({ data: props.data, selectedNodeId, setSelectedNodeId, selectedNode: props.data.nodes.find((node) => node.id === selectedNodeId), selectedEdgeId, setSelectedEdgeId, viewMode, setViewMode, theme, resolvedTheme, setTheme, relationshipConfig, nodeTypeColors: props.nodeTypeColors ?? {}, onEdgeCreate: props.onEdgeCreate, onEdgeDelete: props.onEdgeDelete }), [props.data, props.nodeTypeColors, props.onEdgeCreate, props.onEdgeDelete, selectedNodeId, selectedEdgeId, viewMode, theme, resolvedTheme, relationshipConfig, setSelectedNodeId, setViewMode, setTheme]);
  const sizeStyle = { width: props.width ?? '100%', height: props.height ?? 600, ...props.style };
  return <ExplorerProvider value={value}>
    <Popover.Root open={Boolean(selectedNodeId)} onOpenChange={(open) => { if (!open) setSelectedNodeId(null); }}>
      <section className={`nge-root ${props.className ?? ''}`} data-theme={resolvedTheme} style={sizeStyle}>
        <Toolbar />
        {errors.length > 0 && <div className="nge-validation" role="alert"><strong>Invalid graph data</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <main className="nge-content">{viewMode === 'graph' ? <GraphView width={width} height={Math.max(300, height - 64)} /> : <FileExplorerView />}</main>
        <RelationshipEditor />
      </section>
      <NodePopoverContent />
    </Popover.Root>
  </ExplorerProvider>;
}
