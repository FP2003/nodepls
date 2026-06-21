import type { NodeData } from '../../types';

export interface TreeFolder { key: string; label: string; folders: TreeFolder[]; nodes: NodeData[] }

const folder = (key: string, label: string): TreeFolder => ({ key, label, folders: [], nodes: [] });

export function buildTree(nodes: NodeData[]): TreeFolder {
  const root = folder('root', 'Root');
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const byFolder = new Map<string, TreeFolder>([['', root]]);
  const ensureFolder = (parts: string[]) => {
    let path = ''; let current = root;
    parts.forEach((part) => {
      path = path ? `${path}/${part}` : part;
      let next = byFolder.get(path);
      if (!next) { next = folder(path, part); current.folders.push(next); byFolder.set(path, next); }
      current = next;
    });
    return current;
  };
  const unfiled = () => ensureFolder(['Unfiled']);
  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = byId.get(node.parentId);
      if (!parent) return unfiled().nodes.push(node);
      const parentPath = normalizePath(parent.path);
      const hierarchy = parentPath[parentPath.length - 1] === parent.label ? parentPath : [...parentPath, parent.label];
      return ensureFolder(hierarchy).nodes.push(node);
    }
    const parts = normalizePath(node.path);
    if (!parts.length) return unfiled().nodes.push(node);
    const folderParts = parts[parts.length - 1] === node.label ? parts.slice(0, -1) : parts;
    ensureFolder(folderParts).nodes.push(node);
  });
  const sort = (item: TreeFolder) => { item.folders.sort((a, b) => a.label.localeCompare(b.label)); item.nodes.sort((a, b) => a.label.localeCompare(b.label)); item.folders.forEach(sort); };
  sort(root);
  return root;
}

function normalizePath(path?: string) {
  return (path ?? '').replace(/\\/g, '/').split('/').map((part: string) => part.trim()).filter((part: string) => part && part !== '.');
}
