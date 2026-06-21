import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NodeGraphExplorer } from '../NodeGraphExplorer';
import { graphPoint } from './GraphView';

describe('graph interaction coordinates', () => {
  it('converts responsive CSS pixels into SVG viewBox coordinates', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 100, y: 50, left: 100, top: 50, right: 550, bottom: 350,
      width: 450, height: 300, toJSON: () => ({}),
    });
    expect(graphPoint(svg, 325, 200, 900, 600)).toEqual({ x: 450, y: 300 });
  });

  it('keeps pan calculations stable after pointer release and handles wheel non-passively', () => {
    render(createElement(NodeGraphExplorer, { data: { nodes: [{ id: 'a', label: 'Alpha' }], edges: [] } }));
    const svg = screen.getByLabelText('Node graph') as unknown as SVGSVGElement;
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 450, bottom: 300,
      width: 450, height: 300, toJSON: () => ({}),
    });
    Object.defineProperty(svg, 'setPointerCapture', { value: vi.fn() });
    expect(() => {
      fireEvent.pointerDown(svg, { pointerId: 1, clientX: 10, clientY: 10 });
      fireEvent.pointerMove(svg, { pointerId: 1, clientX: 20, clientY: 20 });
      fireEvent.pointerUp(svg, { pointerId: 1, clientX: 20, clientY: 20 });
    }).not.toThrow();
    const wheel = new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: 100, clientY: 100, deltaY: 20 });
    svg.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
  });
});
