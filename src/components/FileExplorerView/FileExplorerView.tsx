import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useExplorer } from '../../state/ExplorerContext';
import { Popover } from '../NodePopover';
import { buildTree, type TreeFolder } from './tree';

function Folder({ folder, depth = 0 }: { folder: TreeFolder; depth?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <li>
      <button className="nge-tree__folder" style={{ paddingInlineStart: 12 + depth * 18 }} type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span> {folder.label}
      </button>
      <AnimatePresence initial={false}>{open && <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .14 }}>
        {folder.folders.map((child) => <Folder key={child.key} folder={child} depth={depth + 1} />)}
        {folder.nodes.map((node) => <TreeNode key={node.id} nodeId={node.id} depth={depth + 1} />)}
      </motion.ul>}</AnimatePresence>
    </li>
  );
}

function TreeNode({ nodeId, depth }: { nodeId: string; depth: number }) {
  const { data, selectedNodeId, setSelectedNodeId, setSelectedEdgeId } = useExplorer();
  const node = data.nodes.find((item) => item.id === nodeId)!;
  const button = <button className="nge-tree__node" style={{ paddingInlineStart: 29 + depth * 18 }} type="button" aria-label={`${node.label}${node.type ? `, ${node.type}` : ''}`} aria-pressed={selectedNodeId === node.id} onFocus={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }} onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }}><span>{node.label}</span>{node.type && <span className="nge-badge">{node.type}</span>}</button>;
  return <li>{selectedNodeId === node.id ? <Popover.Anchor asChild>{button}</Popover.Anchor> : button}</li>;
}

export function FileExplorerView() {
  const { data } = useExplorer();
  const tree = buildTree(data.nodes);
  return <nav className="nge-tree" aria-label="Node explorer"><ul>{tree.folders.map((item) => <Folder key={item.key} folder={item} />)}{tree.nodes.map((node) => <TreeNode key={node.id} nodeId={node.id} depth={0} />)}</ul></nav>;
}
