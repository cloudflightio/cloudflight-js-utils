export interface DeferredPromiseHandle<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
}

export function createDeferredPromise<T>(): DeferredPromiseHandle<T> {
    let resolve: DeferredPromiseHandle<T>['resolve'];
    let reject: DeferredPromiseHandle<T>['reject'];

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return {
        promise,
        // @ts-expect-error this value is already assigned at this point in time
        resolve,
        // @ts-expect-error this value is already assigned at this point in time
        reject,
    };
}
