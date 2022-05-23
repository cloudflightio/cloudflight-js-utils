import { Query } from '@datorama/akita';
import {
    InteropObservable,
    Observable,
    Observer,
    Subscribable,
    Unsubscribable,
} from 'rxjs';

interface SelectionProviders<T> {
    observable(): Observable<T>;
    sync(): T;
}

export class Selection<T> implements InteropObservable<T>, Subscribable<T> {
    public constructor(private provider: SelectionProviders<T>) {}

    public [Symbol.observable](): Subscribable<T> {
        return this;
    }

    public subscribe(observer: Partial<Observer<T>>): Unsubscribable {
        return this.provider.observable().subscribe(observer);
    }

    public get sync(): T {
        return this.provider.sync();
    }
}

type Projection<T, P = unknown> = (state: T) => P;

export function selectFrom<T, K extends keyof T>(
    query: Query<T>,
    key: K
): Selection<T[K]>;
export function selectFrom<T, P>(
    query: Query<T>,
    project: (state: T) => P
): Selection<P>;
export function selectFrom<T>(query: Query<T>): Selection<T>;
export function selectFrom<T, K extends keyof T>(
    query: Query<T>,
    keyOrProjection?: K | Projection<T>
): Selection<T | T[K] | unknown> {
    if (keyOrProjection == null) {
        return new Selection<T>({
            observable(): Observable<T> {
                return query.select();
            },
            sync(): T {
                return query.getValue();
            },
        });
    } else if (typeof keyOrProjection === 'function') {
        return new Selection<unknown>({
            observable(): Observable<unknown> {
                return query.select(keyOrProjection);
            },
            sync(): unknown {
                return keyOrProjection(query.getValue());
            },
        });
    } else {
        return new Selection<T[K]>({
            observable(): Observable<T[K]> {
                return query.select(keyOrProjection);
            },
            sync(): T[K] {
                return query.getValue()[keyOrProjection];
            },
        });
    }
}
