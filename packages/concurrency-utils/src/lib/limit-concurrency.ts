import { ConcurrencyPool, concurrencyPoolOfSize } from './concurrency-pool';

/**
 * Ensures only `pool` instances of the provided function is running.
 *
 * In case a {@link ConcurrencyPool} is passed, then only as many instances
 * will run as there are **free tokens**. This mean if the pool is also used
 * somewhere else, then more instances of the function will start running
 * when the pool has available tokens again.
 */
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
