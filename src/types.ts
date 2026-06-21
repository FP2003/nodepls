import type { CSSProperties } from 'react';

export interface NodeData {
  id: string;
  label: string;
  type?: string;
  metadata?: Record<string, string | number | boolean>;
  color?: string;
  path?: string;
  parentId?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  directional?: boolean;
}

export interface RelationshipStyle {
  color: string;
  style?: 'solid' | 'dashed';
  directional?: boolean;
}

export type RelationshipConfig = Record<string, RelationshipStyle>;

export interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export type ExplorerTheme = 'light' | 'dark' | 'system';
export type ViewMode = 'graph' | 'explorer';

export interface NodeGraphExplorerProps {
  data: GraphData;
  relationshipConfig?: RelationshipConfig;
  nodeTypeColors?: Record<string, string>;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  selectedNodeId?: string | null;
  defaultSelectedNodeId?: string | null;
  onSelectedNodeChange?: (nodeId: string | null) => void;
  viewMode?: ViewMode;
  defaultViewMode?: ViewMode;
  onViewModeChange?: (viewMode: ViewMode) => void;
  theme?: ExplorerTheme;
  defaultTheme?: ExplorerTheme;
  onThemeChange?: (theme: ExplorerTheme) => void;
  onEdgeCreate?: (edge: EdgeData) => void;
  onEdgeDelete?: (edgeId: string) => void;
}
