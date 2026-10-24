import { useCallback, useEffect, useState } from 'react';

export function useResource<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    load().then(result => { if (active) setData(result); }).catch((err: unknown) => {
      if (active) setError(err instanceof Error ? err.message : 'Unable to load campus information');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load, version]);
  return { data, setData, error, loading, reload };
}
