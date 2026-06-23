import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NodeGraphExplorer } from './NodeGraphExplorer';

const nodes = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
];
const edges = [{ id: 'e1', source: 'a', target: 'b', type: 'references' }];

function renderWithEditor(overrides?: Partial<Parameters<typeof NodeGraphExplorer>[0]>) {
  const create = vi.fn();
  render(<NodeGraphExplorer data={{ nodes, edges }} onEdgeCreate={create} {...overrides} />);
  return { create };
}

describe('RelationshipEditor', () => {
  it('shows the Add relationship button when onEdgeCreate is provided', () => {
    renderWithEditor();
    expect(screen.getByRole('button', { name: 'Add relationship' })).toBeInTheDocument();
  });

  it('does not render when onEdgeCreate is absent', () => {
    render(<NodeGraphExplorer data={{ nodes, edges }} />);
    expect(screen.queryByRole('button', { name: 'Add relationship' })).not.toBeInTheDocument();
  });

  it('does not render when there are no nodes', () => {
    render(<NodeGraphExplorer data={{ nodes: [], edges: [] }} onEdgeCreate={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Add relationship' })).not.toBeInTheDocument();
  });

  it('opens and closes the panel', () => {
    renderWithEditor();
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
  });

  it('calls onEdgeCreate with correct data on submit', () => {
    const { create } = renderWithEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'custom-type' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ source: 'a', target: 'b', type: 'custom-type', id: expect.any(String) }));
  });

  it('shows an error when trying to create a duplicate relationship', () => {
    renderWithEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'references' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('alert')).toHaveTextContent('already exists');
  });

  it('shows an error when relationship type is blank', () => {
    renderWithEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('alert')).toHaveTextContent('relationship type');
  });

  it('closes the panel and resets error after successful create', () => {
    const { create } = renderWithEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Add relationship' }));
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'new-link' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(create).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
  });
});
