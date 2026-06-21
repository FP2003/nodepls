import { createContext, useContext } from 'react';
import type { EdgeData, ExplorerTheme, GraphData, NodeData, RelationshipConfig, ViewMode } from '../types';

export interface ExplorerContextValue {
  data: GraphData;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedNode: NodeData | undefined;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: ExplorerTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ExplorerTheme) => void;
  relationshipConfig: RelationshipConfig;
  nodeTypeColors: Record<string, string>;
  onEdgeCreate?: (edge: EdgeData) => void;
  onEdgeDelete?: (edgeId: string) => void;
}

const ExplorerContext = createContext<ExplorerContextValue | null>(null);

export const ExplorerProvider = ExplorerContext.Provider;

export function useExplorer() {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error('useExplorer must be used inside NodeGraphExplorer');
  return value;
}
