import { useLayoutEffect, useState } from 'react';

export default function useDebouncedValue<T>(value: T, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useLayoutEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
