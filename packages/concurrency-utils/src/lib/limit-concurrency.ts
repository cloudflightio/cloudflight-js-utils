import { ConcurrencyPool, concurrencyPoolOfSize } from './concurrency-pool';

export function limitConcurrency<Args extends unknown[], Return>(
  pool: ConcurrencyPool | number,
  fn: (...params: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  const actualPool =
    typeof pool === 'number' ? concurrencyPoolOfSize(pool) : pool;

  return async (...args: Args) => {
    const token = await actualPool.acquireToken();

    try {
      return await fn(...args);
    } finally {
      token.release();
    }
  };
}
