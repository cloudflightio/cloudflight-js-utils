import {concurrencyPoolOfSize} from './concurrency-pool';
import {debounceLatestWithPool} from './debounce-latest';
import {sleep} from './common/sleep';

describe('debounceLatestWithPool', () => {
    describe('when debouncing function', () => {
        it('given only one invocation then it get called once', async () => {
            const fn = jest.fn(async () => {
                await sleep(10);
            });
            const pool = concurrencyPoolOfSize(1);

            const debouncedFn = debounceLatestWithPool(pool, fn);

            await debouncedFn();

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('given multiple invocations then last one gets called for sure', async () => {
            const fn = jest.fn(async (callCount: number) => {
                await sleep(10);

                return callCount;
            });
            const pool = concurrencyPoolOfSize(1);

            const debouncedFn = debounceLatestWithPool(pool, fn);

            const token = await pool.acquireToken();

            const invocation1 = debouncedFn(1);
            const invocation2 = debouncedFn(2);
            const invocation3 = debouncedFn(3);
            const invocation4 = debouncedFn(4);
            const invocation5 = debouncedFn(5);
            const invocation6 = debouncedFn(6);
            const invocation7 = debouncedFn(7);

            token.release();

            await expect(invocation1).resolves.toEqual(7);
            await expect(invocation2).resolves.toEqual(7);
            await expect(invocation3).resolves.toEqual(7);
            await expect(invocation4).resolves.toEqual(7);
            await expect(invocation5).resolves.toEqual(7);
            await expect(invocation6).resolves.toEqual(7);
            await expect(invocation7).resolves.toEqual(7);

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn.mock.calls[0]?.[0]).toBe(7);
        });

        it('given multiple invocations and the last one throws an error, then all promises should reject', async () => {
            const fn = jest.fn(async (callCount: number): Promise<number> => {
                if (callCount < 0) {
                    throw new Error('abc');
                }
                return callCount;
            });
            const pool = concurrencyPoolOfSize(1);

            const debouncedFn = debounceLatestWithPool(pool, fn);

            const token = await pool.acquireToken();

            const invocation1 = debouncedFn(1);
            const invocation2 = debouncedFn(2);
            const invocation3 = debouncedFn(-1);

            token.release();

            await expect(invocation1).rejects.toThrow();
            await expect(invocation2).rejects.toThrow();
            await expect(invocation3).rejects.toThrow();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn.mock.calls[0]?.[0]).toBe(-1);
        });
    });
});
