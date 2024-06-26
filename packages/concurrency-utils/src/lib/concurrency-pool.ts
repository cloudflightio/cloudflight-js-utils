import {createDeferredPromise, DeferredPromiseHandle} from './common/deferred-promise-handle';

const concurrencyPoolTypeGuard = Symbol('concurrencyPoolTypeGuard');

export interface ConcurrencyPool {
    /**
     * Type guard to prevent anyone outside from this library
     * from creating concurrency pools. Type casting can still
     * circumvent this mechanism but that is unsound in itself
     * anyway.
     */
    [concurrencyPoolTypeGuard]: never;

    /**
     * Acquires a token from the pool. If there are no tokens left, i.e.
     * pool is of size 3 and 3 token have been granted, then this method
     * will wait until one is available again.
     */
    acquireToken(): Promise<ConcurrencyToken>;
}

export interface ConcurrencyToken {
    /**
     * Gives back the token to pool it belongs to and is ready to be
     * acquired again. Calling this method multiple times does nothing.
     */
    release(): void;
}

/**
 * Gets thrown when trying to create a {@link ConcurrencyPool} with anything
 * smaller than 1. An empty or negative sized pool does not make any sense.
 */
export class InvalidConcurrencyPoolSizeException extends Error {
    public constructor(size: number) {
        super(`Concurrency pool initialized with size ${String(size)} but should be at least 1`);
    }
}

export function concurrencyPoolOfSize(maxCount: number): ConcurrencyPool {
    if (maxCount < 1) {
        throw new InvalidConcurrencyPoolSizeException(maxCount);
    }

    const queue: DeferredPromiseHandle<ConcurrencyToken>[] = [];
    let currentTaskCount = 0;

    // eslint-disable-next-line func-style
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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        [concurrencyPoolTypeGuard]: undefined as never,
        async acquireToken(): Promise<ConcurrencyToken> {
            const handle = createDeferredPromise<ConcurrencyToken>();

            queue.push(handle);

            acquireNextIfPossible();

            return handle.promise;
        },
    };
}

/**
 * Creates a sub concurrency pool which acquires tokens from the parent pool
 * instead. The size of this sub pool is the max limit it can acquire.
 *
 * This is useful when resource distribution is needed.
 */
export function subConcurrencyPoolFrom(size: number, pool: ConcurrencyPool): ConcurrencyPool {
    const subPool = concurrencyPoolOfSize(size);

    return {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        [concurrencyPoolTypeGuard]: undefined as never,
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
