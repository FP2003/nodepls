# @nodepls/node-graph-explorer

Interactive force-directed graph and file explorer for React.

## Installation

```bash
npm install @nodepls/node-graph-explorer
```

## How to use

Import both the component and its stylesheet. The package treats `data` as controlled state: your application owns the nodes and relationships and passes the latest value back to the explorer.

```tsx
import { useState } from 'react';
import {
  NodeGraphExplorer,
  type EdgeData,
  type GraphData,
  type NodeData,
} from '@nodepls/node-graph-explorer';
import '@nodepls/node-graph-explorer/styles.css';

const initialData: GraphData = {
  nodes: [
    {
      id: 'home',
      label: 'Home',
      type: 'page',
      path: 'Workspace/Home',
      metadata: { status: 'Published', owner: 'Ada' },
    },
    {
      id: 'notes',
      label: 'Research notes',
      type: 'note',
      path: 'Workspace/Research/Research notes',
    },
  ],
  edges: [
    {
      id: 'home-notes',
      source: 'home',
      target: 'notes',
      type: 'references',
      directional: true,
    },
  ],
};

export function App() {
  const [data, setData] = useState(initialData);

  const addEdge = (edge: EdgeData) => {
    setData((current) => ({
      ...current,
      edges: [...current.edges, edge],
    }));
  };

  const removeEdge = (edgeId: string) => {
    setData((current) => ({
      ...current,
      edges: current.edges.filter((edge) => edge.id !== edgeId),
    }));
  };

  return (
    <NodeGraphExplorer
      data={data}
      height={600}
      nodeTypeColors={{ page: '#5db8a6', note: '#e8a55a' }}
      relationshipConfig={{
        references: {
          color: '#5db8a6',
          directional: true,
        },
        related: {
          color: '#e8a55a',
          style: 'dashed',
        },
      }}
      onEdgeCreate={addEdge}
      onEdgeDelete={removeEdge}
    />
  );
}
```

The Graph/Explorer and theme controls work internally by default. To control them from your application, pass the corresponding value and change callback:

```tsx
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'graph' | 'explorer'>('graph');
const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

<NodeGraphExplorer
  data={data}
  selectedNodeId={selectedNodeId}
  onSelectedNodeChange={setSelectedNodeId}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  theme={theme}
  onThemeChange={setTheme}
/>
```

Use `defaultSelectedNodeId`, `defaultViewMode`, or `defaultTheme` when you only need an initial value.

## FAQ

### How do I edit a node's label, type, metadata, color, or path?

Update that node in your application's `data.nodes` state. The metadata popover is read-only; editing remains under the consumer application's control.

```tsx
function updateNode(nodeId: string, changes: Partial<NodeData>) {
  setData((current) => ({
    ...current,
    nodes: current.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...changes } : node,
    ),
  }));
}

updateNode('notes', {
  label: 'Reviewed research',
  metadata: { status: 'Reviewed', words: 1200 },
});
```

Import `NodeData` from the package when using the typed helper above. Metadata values can be strings, numbers, or booleans.

### How do I add or remove nodes?

Add or remove entries in `data.nodes`. If you remove a node, also remove relationships that reference its ID.

```tsx
setData((current) => ({
  nodes: current.nodes.filter((node) => node.id !== nodeId),
  edges: current.edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId,
  ),
}));
```

Node and edge IDs must be unique.

### How does the built-in relationship editor work?

Pass `onEdgeCreate` to display the **Add relationship** control. The explorer supplies a generated edge with the selected source, target, and type. Your callback must add it to `data.edges`; otherwise the relationship will not appear.

The editor allows reverse and self-referential relationships. It rejects missing endpoints and duplicate relationships with the same source, target, and type.

### How do I remove a relationship?

Pass `onEdgeDelete`, select an edge, then use **Remove relationship** or the Delete key. Your callback receives the edge ID and must remove it from `data.edges`.

### How do I edit an existing relationship?

There is no inline relationship-editing form. Replace or update the matching edge in your application state:

```tsx
function updateEdge(edgeId: string, changes: Partial<EdgeData>) {
  setData((current) => ({
    ...current,
    edges: current.edges.map((edge) =>
      edge.id === edgeId ? { ...edge, ...changes } : edge,
    ),
  }));
}

updateEdge('home-notes', {
  type: 'related',
  label: 'Background reading',
  directional: false,
});
```

### How do I configure relationship colors, line styles, and arrows?

Use `relationshipConfig`, keyed by the edge's `type`. Supported styles are `solid` and `dashed`. Direction can be configured for a whole relationship type or overridden on an individual edge with `directional`.

### How do I organize the Explorer hierarchy?

Set a node's `path` using `/`-separated folders, such as `Workspace/Research/My note`. A node's `parentId` takes precedence when supplied. Nodes without a usable path or parent appear under **Unfiled**.

### How do I assign node colors?

Use `nodeTypeColors` to color every node of a type. Set `color` on an individual node to override its type color.

### How do I customize the component's appearance?

Pass `className` or `style` to the root component and override the namespaced CSS variables from your stylesheet:

```css
.my-graph,
.my-graph[data-theme='dark'] {
  --nge-primary: #9b6cff;
  --nge-canvas: #fffdf8;
  --nge-surface: #f3eee5;
  --nge-accent-teal: #3a9c8a;
}
```

```tsx
<NodeGraphExplorer className="my-graph" data={data} height="70vh" />
```

### Does the package persist changes or theme preferences?

No. Persist `data`, selection, view mode, or theme in your own state, store, API, or browser storage. The package only renders the values it receives and reports user actions through callbacks.

## Development

Run `npm run dev` for the included demo, or `npm run check` to lint, test, and build the package.
