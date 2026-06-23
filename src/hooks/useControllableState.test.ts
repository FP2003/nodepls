import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './useControllableState';

describe('useControllableState', () => {
  it('uses the default value when uncontrolled', () => {
    const { result } = renderHook(() => useControllableState(undefined, 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('uses the controlled value when provided', () => {
    const { result } = renderHook(() => useControllableState('controlled', 'default'));
    expect(result.current[0]).toBe('controlled');
  });

  it('updates internal state when uncontrolled', () => {
    const { result } = renderHook(() => useControllableState<string>(undefined, 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(result.current[0]).toBe('updated');
  });

  it('does not update internal state when controlled', () => {
    const { result } = renderHook(() => useControllableState('fixed', 'default'));
    act(() => { result.current[1]('ignored'); });
    expect(result.current[0]).toBe('fixed');
  });

  it('fires onChange when value actually changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<string>(undefined, 'a', onChange));
    act(() => { result.current[1]('b'); });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('does not fire onChange when value is the same', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState<string>(undefined, 'same', onChange));
    act(() => { result.current[1]('same'); });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fires onChange for controlled prop when value differs', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState('controlled', 'default', onChange));
    act(() => { result.current[1]('new-value'); });
    expect(onChange).toHaveBeenCalledWith('new-value');
  });
});
