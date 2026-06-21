import { useCallback, useState } from 'react';

export function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled === undefined ? internal : controlled;
  const setValue = useCallback(
    (next: T) => {
      if (controlled === undefined) setInternal(next);
      if (!Object.is(value, next)) onChange?.(next);
    },
    [controlled, onChange, value],
  );
  return [value, setValue] as const;
}
