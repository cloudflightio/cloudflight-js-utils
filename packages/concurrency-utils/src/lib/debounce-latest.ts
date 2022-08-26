import {
  createDeferredPromise,
  DeferredPromiseHandle,
} from './common/deferred-promise-handle';
import { ConcurrencyPool, subConcurrencyPoolFrom } from './concurrency-pool';

interface Item<T, Args extends unknown[]> {
  handle: DeferredPromiseHandle<T>;
  args: Args;
}

export function debounceLatestWithPool<Args extends unknown[], Return>(
  pool: ConcurrencyPool,
  fn: (...params: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  const subPool = subConcurrencyPoolFrom(1, pool);
  const buffer: Item<Return, Args>[] = [];

  const doStuff = async (items: Item<Return, Args>[]): Promise<Return> => {
    const itemToUse = items[items.length - 1];

    if (itemToUse == null) {
      throw new Error('itemToUse is empty but should never happen');
    }

    try {
      const value = await fn(...itemToUse.args);

      items.forEach((item) => {
        // we don't want to resolve the current item because its handle will not be returned
        if (item !== itemToUse) {
          item.handle.resolve(value);
        }
      });

      return value;
    } catch (e: unknown) {
      items.forEach((item) => {
        // we don't want to reject the current item because its handle will not be returned
        if (item !== itemToUse) {
          item.handle.reject(e);
        }
      });
      throw e;
    }
  };

  return async (...args: Args) => {
    const selfData: Item<Return, Args> = {
      handle: createDeferredPromise<Return>(),
      args,
    };

    buffer.push(selfData);

    const token = await subPool.acquireToken();

    if (buffer[buffer.length - 1] !== selfData) {
      token.release();

      return selfData.handle.promise;
    }

    const toX = buffer.splice(0);

    try {
      return await doStuff(toX);
    } finally {
      token.release();
    }
  };
}
