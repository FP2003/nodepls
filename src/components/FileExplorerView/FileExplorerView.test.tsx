import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NodeGraphExplorer } from '../NodeGraphExplorer';

const nodes = [
  { id: 'a', label: 'Alpha', path: 'Docs/Alpha', type: 'note' },
  { id: 'b', label: 'Beta', path: 'Docs/Beta' },
  { id: 'c', label: 'Gamma' },
];
const edges = [{ id: 'e1', source: 'a', target: 'b', type: 'related' }];

describe('FileExplorerView', () => {
  it('renders all nodes in explorer view', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    expect(screen.getByRole('button', { name: /Alpha/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Beta/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gamma/ })).toBeInTheDocument();
  });

  it('groups nodes under folder paths', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    expect(screen.getByRole('button', { name: /Docs/ })).toBeInTheDocument();
  });

  it('places nodes without a path in the Unfiled folder', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    expect(screen.getByRole('button', { name: /Unfiled/ })).toBeInTheDocument();
  });

  it('collapses and expands a folder via aria-expanded', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    const docsFolder = screen.getByRole('button', { name: /Docs/ });
    const docsTreeitem = docsFolder.closest('[role="treeitem"]')!;
    expect(docsTreeitem).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(docsFolder);
    expect(docsTreeitem).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(docsFolder);
    expect(docsTreeitem).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onSelectedNodeChange when a node is clicked', () => {
    const onSelected = vi.fn();
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" onSelectedNodeChange={onSelected} />);
    fireEvent.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(onSelected).toHaveBeenCalledWith('a');
  });

  it('shows the type badge alongside the label', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    expect(screen.getByText('note')).toBeInTheDocument();
  });

  it('returns null for a tree node whose id no longer exists in data', () => {
    const { rerender } = render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    // Remove node 'a' — the TreeNode for 'a' should return null without crashing
    const prunedNodes = nodes.filter((n) => n.id !== 'a');
    expect(() => rerender(<NodeGraphExplorer data={{ nodes: prunedNodes, edges: [] }} defaultViewMode="explorer" />)).not.toThrow();
    expect(screen.queryByRole('button', { name: /Alpha/ })).not.toBeInTheDocument();
  });

  it('has the correct ARIA tree roles', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} defaultViewMode="explorer" />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
    const treeitems = screen.getAllByRole('treeitem');
    expect(treeitems.length).toBeGreaterThan(0);
  });
});
