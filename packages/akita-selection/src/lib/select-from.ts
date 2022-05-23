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

export function selectFrom<T, K extends keyof T>(
    query: Query<T>,
    key: K
): Selection<T[K]>;
export function selectFrom<T>(query: Query<T>): Selection<T>;
export function selectFrom<T, K extends keyof T>(
    query: Query<T>,
    key?: K
): Selection<T | T[K]> {
    if (key == null) {
        return new Selection<T>({
            observable(): Observable<T> {
                return query.select();
            },
            sync(): T {
                return query.getValue();
            },
        });
    } else {
        return new Selection<T[K]>({
            observable(): Observable<T[K]> {
                return query.select(key);
            },
            sync(): T[K] {
                return query.getValue()[key];
            },
        });
    }
}
