import { useEffect, useMemo, useState } from 'react';
import { useExplorer } from '../state/ExplorerContext';
import type { EdgeData } from '../types';

function edgeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? `nge-${crypto.randomUUID()}` : `nge-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function RelationshipEditor() {
  const { data, relationshipConfig, onEdgeCreate } = useExplorer();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState(data.nodes[0]?.id ?? '');
  const [target, setTarget] = useState(data.nodes[1]?.id ?? data.nodes[0]?.id ?? '');
  const types = useMemo(() => Object.keys(relationshipConfig), [relationshipConfig]);
  const [type, setType] = useState(types[0] ?? 'references');
  const [error, setError] = useState('');

  useEffect(() => {
    if (source && !data.nodes.some((n) => n.id === source)) setSource(data.nodes[0]?.id ?? '');
  }, [data.nodes, source]);

  useEffect(() => {
    if (target && !data.nodes.some((n) => n.id === target)) setTarget(data.nodes[1]?.id ?? data.nodes[0]?.id ?? '');
  }, [data.nodes, target]);

  if (!onEdgeCreate) return null;
  if (data.nodes.length === 0) return null;

  const submit = () => {
    if (!data.nodes.some((node) => node.id === source) || !data.nodes.some((node) => node.id === target)) return setError('Choose valid source and target nodes.');
    const relation = type.trim();
    if (!relation) return setError('Enter a relationship type.');
    if (data.edges.some((edge) => edge.source === source && edge.target === target && edge.type === relation)) return setError('That relationship already exists.');
    const config = relationshipConfig[relation];
    const edge: EdgeData = { id: edgeId(), source, target, type: relation, ...(config?.directional === undefined ? {} : { directional: config.directional }) };
    onEdgeCreate(edge); setError(''); setOpen(false);
  };
  return <div className="nge-editor">
    <button className="nge-primary-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>Add relationship</button>
    {open && <div className="nge-editor__panel">
      <label>Source<select value={source} onChange={(e) => setSource(e.target.value)}>{data.nodes.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}</select></label>
      <label>Target<select value={target} onChange={(e) => setTarget(e.target.value)}>{data.nodes.map((node) => <option key={node.id} value={node.id}>{node.label}</option>)}</select></label>
      <label>Relationship<input list="nge-relationship-types" value={type} onChange={(e) => setType(e.target.value)} /><datalist id="nge-relationship-types">{types.map((item) => <option key={item} value={item} />)}</datalist></label>
      {error && <p role="alert" className="nge-error">{error}</p>}
      <div><button className="nge-primary-button" type="button" onClick={submit}>Create</button><button className="nge-secondary-button" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
    </div>}
  </div>;
}
