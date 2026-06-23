import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useResolvedTheme } from './useResolvedTheme';

// The matchMedia mock in setup.ts returns matches: false (light system theme).
describe('useResolvedTheme', () => {
  it('returns "light" for the "light" theme', () => {
    const { result } = renderHook(() => useResolvedTheme('light'));
    expect(result.current).toBe('light');
  });

  it('returns "dark" for the "dark" theme', () => {
    const { result } = renderHook(() => useResolvedTheme('dark'));
    expect(result.current).toBe('dark');
  });

  it('resolves "system" to "light" when system is in light mode', () => {
    const { result } = renderHook(() => useResolvedTheme('system'));
    expect(result.current).toBe('light');
  });

  it('resolves "system" to "dark" when system is in dark mode', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { result } = renderHook(() => useResolvedTheme('system'));
    expect(result.current).toBe('dark');
    // Restore
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('registers and removes a change listener for system theme', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    const { unmount } = renderHook(() => useResolvedTheme('system'));
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    // Restore default mock
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('updates when the system preference changes', () => {
    let listener: (() => void) | null = null;
    const mockMedia = { matches: false, media: '(prefers-color-scheme: dark)', onchange: null, dispatchEvent: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn().mockImplementation((_: string, fn: () => void) => { listener = fn; }), removeEventListener: vi.fn() };
    vi.mocked(window.matchMedia).mockReturnValue(mockMedia);
    const { result } = renderHook(() => useResolvedTheme('system'));
    expect(result.current).toBe('light');
    mockMedia.matches = true;
    act(() => { listener?.(); });
    expect(result.current).toBe('dark');
    // Restore
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({ matches: false, media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }));
  });
});
