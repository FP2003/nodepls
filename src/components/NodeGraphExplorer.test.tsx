import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NodeGraphExplorer } from './NodeGraphExplorer';

const data = { nodes: [{ id: 'a', label: 'Alpha', type: 'note', metadata: { status: 'ready' } }, { id: 'b', label: 'Beta', path: 'Docs/Beta' }], edges: [{ id: 'e', source: 'a', target: 'b', type: 'related' }] };

describe('NodeGraphExplorer', () => {
  it('manages default view and selection and keeps it across views', () => {
    const changed = vi.fn();
    render(<NodeGraphExplorer data={data} defaultViewMode="explorer" onSelectedNodeChange={changed} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alpha, note' }));
    expect(changed).toHaveBeenCalledWith('a');
    expect(screen.getByText('Connections')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Graph' }));
    expect(screen.getByRole('button', { name: 'Alpha, note' })).toBeInTheDocument();
  });
  it('does not change a controlled view without a prop update', () => {
    const change = vi.fn();
    render(<NodeGraphExplorer data={data} viewMode="explorer" onViewModeChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'Graph' }));
    expect(change).toHaveBeenCalledWith('graph');
    expect(screen.getByRole('navigation', { name: 'Node explorer' })).toBeInTheDocument();
  });
  it('emits a valid consumer-owned edge', () => {
    const create = vi.fn();
    render(<NodeGraphExplorer data={data} defaultViewMode="explorer" onEdgeCreate={create} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'new-type' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ source: 'a', target: 'b', type: 'new-type' }));
  });
});
