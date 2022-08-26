import {
  createDeferredPromise,
  DeferredPromiseHandle,
} from './common/deferred-promise-handle';

const concurrencyPoolTypeGuard = Symbol('concurrencyPoolTypeGuard');

export interface ConcurrencyPool {
  [concurrencyPoolTypeGuard]: never;

  readonly isIdle: boolean;

  acquireToken(): Promise<ConcurrencyToken>;
}

export interface ConcurrencyToken {
  release(): void;
}

export class InvalidConcurrencyPoolSizeException extends Error {
  public constructor(size: number) {
    super(
      `Concurrency pool initialized with size ${size} but should be at least 1`
    );
  }
}

export function concurrencyPoolOfSize(maxCount: number): ConcurrencyPool {
  if (maxCount < 1) {
    throw new InvalidConcurrencyPoolSizeException(maxCount);
  }

  const queue: DeferredPromiseHandle<ConcurrencyToken>[] = [];
  let currentTaskCount = 0;

  const acquireNextIfPossible = (): void => {
    if (currentTaskCount >= maxCount || queue.length === 0) {
      return;
    }

    const nextAcquirer = queue.splice(0, 1)[0];

    if (nextAcquirer == null) {
      return;
    }

    currentTaskCount++;

    let released = false;
    nextAcquirer.resolve({
      release() {
        if (!released) {
          released = true;
          currentTaskCount--;
          acquireNextIfPossible();
        }
      },
    });
  };

  return {
    [concurrencyPoolTypeGuard]: undefined as never,
    get isIdle(): boolean {
      return queue.length === 0 && currentTaskCount === 0;
    },
    async acquireToken(): Promise<ConcurrencyToken> {
      const handle = createDeferredPromise<ConcurrencyToken>();

      queue.push(handle);

      acquireNextIfPossible();

      return handle.promise;
    },
  };
}

export function subConcurrencyPoolFrom(
  size: number,
  pool: ConcurrencyPool
): ConcurrencyPool {
  const subPool = concurrencyPoolOfSize(size);

  return {
    [concurrencyPoolTypeGuard]: undefined as never,
    get isIdle(): boolean {
      return subPool.isIdle;
    },
    async acquireToken(): Promise<ConcurrencyToken> {
      const subPoolToken = await subPool.acquireToken();
      const token = await pool.acquireToken();

      return {
        release() {
          token.release();
          subPoolToken.release();
        },
      };
    },
  };
}
