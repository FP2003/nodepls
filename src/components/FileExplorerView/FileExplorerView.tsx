import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useExplorer } from '../../state/ExplorerContext';
import { Popover } from '../NodePopover';
import { buildTree, type TreeFolder } from './tree';

interface FolderProps { folder: TreeFolder; depth?: number; index: number; total: number }
interface TreeNodeProps { nodeId: string; depth: number; index: number; total: number }

const Folder = memo(function Folder({ folder, depth = 0, index, total }: FolderProps) {
  const [open, setOpen] = useState(true);
  const childTotal = folder.folders.length + folder.nodes.length;
  return (
    <li role="treeitem" aria-level={depth + 1} aria-posinset={index + 1} aria-setsize={total} aria-expanded={open}>
      <button className="nge-tree__folder" style={{ paddingInlineStart: 12 + depth * 18 }} type="button" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span> {folder.label}
      </button>
      <AnimatePresence initial={false}>{open && <motion.ul role="group" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .14 }}>
        {folder.folders.map((child, i) => <Folder key={child.key} folder={child} depth={depth + 1} index={i} total={childTotal} />)}
        {folder.nodes.map((node, i) => <TreeNode key={node.id} nodeId={node.id} depth={depth + 1} index={folder.folders.length + i} total={childTotal} />)}
      </motion.ul>}</AnimatePresence>
    </li>
  );
});

const TreeNode = memo(function TreeNode({ nodeId, depth, index, total }: TreeNodeProps) {
  const { data, selectedNodeId, setSelectedNodeId, setSelectedEdgeId } = useExplorer();
  const node = data.nodes.find((item) => item.id === nodeId);
  if (!node) return null;
  const button = <button className="nge-tree__node" style={{ paddingInlineStart: 29 + depth * 18 }} type="button" aria-label={`${node.label}${node.type ? `, ${node.type}` : ''}`} aria-pressed={selectedNodeId === node.id} onFocus={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }} onClick={() => { setSelectedEdgeId(null); setSelectedNodeId(node.id); }}><span>{node.label}</span>{node.type && <span className="nge-badge">{node.type}</span>}</button>;
  return (
    <li role="treeitem" aria-level={depth + 1} aria-posinset={index + 1} aria-setsize={total}>
      {selectedNodeId === node.id ? <Popover.Anchor asChild>{button}</Popover.Anchor> : button}
    </li>
  );
});

export function FileExplorerView() {
  const { data } = useExplorer();
  const tree = buildTree(data.nodes);
  const total = tree.folders.length + tree.nodes.length;
  return (
    <nav className="nge-tree" aria-label="Node explorer">
      <ul role="tree">
        {tree.folders.map((item, i) => <Folder key={item.key} folder={item} depth={0} index={i} total={total} />)}
        {tree.nodes.map((node, i) => <TreeNode key={node.id} nodeId={node.id} depth={0} index={tree.folders.length + i} total={total} />)}
      </ul>
    </nav>
  );
}
