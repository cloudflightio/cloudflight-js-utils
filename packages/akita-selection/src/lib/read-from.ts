import { Query } from '@datorama/akita';
import {
    InteropObservable,
    Observable,
    Observer,
    Subscribable,
    Unsubscribable,
} from 'rxjs';
import { PipeOperator } from './type-helpers';

interface SelectionProviders<T> {
    observable(): Observable<T>;
    value(): T;
}

export class Read<T> implements InteropObservable<T>, Subscribable<T> {
    public constructor(private provider: SelectionProviders<T>) {}

    public [Symbol.observable](): Subscribable<T> {
        return this;
    }

    public subscribe(observer: Partial<Observer<T>>): Unsubscribable {
        return this.provider.observable().subscribe(observer);
    }

    public get value(): T {
        return this.provider.value();
    }

    public pipe<R>(operator: PipeOperator<T, R>): Read<R> {
        const provider = this.provider;
        return new Read<R>({
            observable(): Observable<R> {
                return provider.observable().pipe(operator.observableOperator);
            },
            value(): R {
                return operator.valueOperator(provider.value());
            },
        });
    }
}

type Projection<T, P = unknown> = (state: T) => P;

export function readFrom<T, K extends keyof T>(
    query: Query<T>,
    key: K
): Read<T[K]>;
export function readFrom<T, P>(
    query: Query<T>,
    project: (state: T) => P
): Read<P>;
export function readFrom<T>(query: Query<T>): Read<T>;
export function readFrom<T, K extends keyof T>(
    query: Query<T>,
    keyOrProjection?: K | Projection<T>
): Read<T | T[K] | unknown> {
    if (keyOrProjection == null) {
        return new Read<T>({
            observable(): Observable<T> {
                return query.select();
            },
            value(): T {
                return query.getValue();
            },
        });
    } else if (typeof keyOrProjection === 'function') {
        return new Read<unknown>({
            observable(): Observable<unknown> {
                return query.select(keyOrProjection);
            },
            value(): unknown {
                return keyOrProjection(query.getValue());
            },
        });
    } else {
        return new Read<T[K]>({
            observable(): Observable<T[K]> {
                return query.select(keyOrProjection);
            },
            value(): T[K] {
                return query.getValue()[keyOrProjection];
            },
        });
    }
}
