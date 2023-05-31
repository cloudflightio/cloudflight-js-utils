import {createDeferredPromise, DeferredPromiseHandle} from './common/deferred-promise-handle';
import {reusePending} from './reuse-pending';

describe('reusePending', () => {
    let completion: DeferredPromiseHandle<number>;
    let fn: () => Promise<number>;

    beforeEach(() => {
        jest.clearAllMocks();
        completion = createDeferredPromise<number>();
        fn = jest.fn(async () => {
            return await completion.promise;
        });
    });

    describe('when reusing returned Promise of function', () => {
        it('given only one invocation then it gets called once', async () => {
            const reuseFunction = reusePending(fn);

            const result = reuseFunction();
            completion.resolve(2);

            await expect(result).resolves.toEqual(2);
            expect(fn).toBeCalledTimes(1);
        });

        it('given multiple invocations then the pending call gets reused', async () => {
            const reuseFunction = reusePending(fn);

            const result1 = reuseFunction();
            const result2 = reuseFunction();
            const result3 = reuseFunction();

            completion.resolve(2);

            await expect(result1).resolves.toEqual(2);
            await expect(result2).resolves.toEqual(2);
            await expect(result3).resolves.toEqual(2);
            expect(fn).toBeCalledTimes(1);
        });

        it('given multiple invocations and the call rejects then the pending call is reused', async () => {
            const reuseFunction = reusePending(fn);

            const result1 = reuseFunction();
            const result2 = reuseFunction();
            const result3 = reuseFunction();

            const err = new Error();
            completion.reject(err);

            await expect(result1).rejects.toBe(err);
            await expect(result2).rejects.toBe(err);
            await expect(result3).rejects.toBe(err);
            expect(fn).toBeCalledTimes(1);
        });
    });

    describe('when calling the wrapped function multiple times', () => {
        it('given the previous call already resolved then the next should not reuse the Promise', async () => {
            const reuseFunction = reusePending(fn);

            const result1 = reuseFunction();
            completion.resolve(2);

            await expect(result1).resolves.toEqual(2);

            completion = createDeferredPromise<number>();

            const result2 = reuseFunction();
            completion.resolve(3);

            await expect(result2).resolves.toEqual(3);
            expect(fn).toBeCalledTimes(2);
        });

        it('given the previous call already rejected then the next should not reuse the Promise', async () => {
            const reuseFunction = reusePending(fn);

            const result1 = reuseFunction();
            const err = new Error();
            completion.reject(err);

            await expect(result1).rejects.toBe(err);

            completion = createDeferredPromise<number>();

            const result2 = reuseFunction();
            completion.resolve(3);

            await expect(result2).resolves.toEqual(3);
            expect(fn).toBeCalledTimes(2);
        });
    });
});
