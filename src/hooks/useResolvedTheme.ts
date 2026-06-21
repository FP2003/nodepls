import { useEffect, useState } from 'react';
import type { ExplorerTheme } from '../types';

export function useResolvedTheme(theme: ExplorerTheme) {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}
