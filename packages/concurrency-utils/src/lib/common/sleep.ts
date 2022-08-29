import { createDeferredPromise } from './deferred-promise-handle';

export async function sleep(ms: number): Promise<void> {
  const handle = createDeferredPromise<undefined>();

  setTimeout(() => {
    handle.resolve(undefined);
  }, ms);

  return handle.promise;
}
