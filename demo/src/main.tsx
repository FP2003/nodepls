import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NodeGraphExplorer, type EdgeData, type GraphData } from '../../src';
import '../../src/styles.css';
import './demo.css';

const initial: GraphData = {
  nodes: [
    { id: 'home', label: 'Home', type: 'page', path: 'Workspace/Home', metadata: { status: 'Published', owner: 'Filip' } },
    { id: 'graph', label: 'Graph notes', type: 'note', path: 'Workspace/Research/Graph notes', metadata: { words: 840 } },
    { id: 'design', label: 'Design system', type: 'system', path: 'Workspace/Design/Design system', metadata: { version: '0.3' } },
    { id: 'api', label: 'API contract', type: 'code', parentId: 'graph', metadata: { language: 'TypeScript' } },
    { id: 'ideas', label: 'Loose ideas', type: 'note' },
  ],
  edges: [
    { id: 'e1', source: 'home', target: 'graph', type: 'references', directional: true },
    { id: 'e2', source: 'graph', target: 'api', type: 'related' },
    { id: 'e3', source: 'design', target: 'home', type: 'supports', directional: true },
    { id: 'e4', source: 'ideas', target: 'graph', type: 'related' },
  ],
};

function Demo() {
  const [data, setData] = useState(initial);
  const create = (edge: EdgeData) => setData((value) => ({ ...value, edges: [...value.edges, edge] }));
  const remove = (id: string) => setData((value) => ({ ...value, edges: value.edges.filter((edge) => edge.id !== id) }));
  return <div className="demo"><header><span>NODEPLS</span><h1>See how everything connects.</h1><p>A consumer-controlled graph and file explorer, rendered from the same data.</p></header><NodeGraphExplorer data={data} height={680} nodeTypeColors={{ page: '#5db8a6', note: '#e8a55a', system: '#5db872', code: '#8b7ec8' }} relationshipConfig={{ supports: { color: '#5db872', directional: true } }} onEdgeCreate={create} onEdgeDelete={remove} /></div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Demo /></StrictMode>);
