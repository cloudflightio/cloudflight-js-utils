import {
  createDeferredPromise,
  DeferredPromiseHandle,
} from './common/deferred-promise-handle';
import { ConcurrencyPool, subConcurrencyPoolFrom } from './concurrency-pool';

interface Item<T, Args extends unknown[]> {
  handle: DeferredPromiseHandle<T>;
  args: Args;
}

/**
 * Debounce the given function. Only one instance of the function can ever run.
 * The `pool` is required on purpose, because the only reason you would want
 * to use this instead of a normal debounce function is to also acquire a
 * concurrency token when it runs.
 *
 * The returned function returns the result of the last call to all previous
 * invocations on purpose and might be called multiple times itself. If you only
 * want the function to execute one on multiple invocations then take a look
 * at {@link reusePending}.
 */
export function debounceLatestWithPool<Args extends unknown[], Return>(
  pool: ConcurrencyPool,
  fn: (...params: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  const subPool = subConcurrencyPoolFrom(1, pool);
  const buffer: Item<Return, Args>[] = [];

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
      return await doStuff(fn, toX);
    } finally {
      token.release();
    }
  };
}

async function doStuff<Args extends unknown[], Return>(
  fn: (...params: Args) => Promise<Return>,
  items: Item<Return, Args>[]
): Promise<Return> {
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
}
