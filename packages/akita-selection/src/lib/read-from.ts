import { Query } from '@datorama/akita';
import {
    InteropObservable,
    Observable,
    Observer,
    Subscribable,
    Unsubscribable,
} from 'rxjs';
import {
    OperatorPipeline,
    ReturnTypeOfTailOperator,
} from './operators/operator.types';
import { pipe, PipeFnNext, PipeFnResult } from './pipe/pipe';
import { And, MaybeUndefined } from './type-helpers';
import {
    ContainsCancellingPipeOperator,
    PipeOperator,
} from './util/pipe.operator';

interface ContinuingReadProvider<T> {
    observable(): Observable<T>;
    result(): PipeFnNext<T>;
}

interface CancellingReadProvider<T> {
    observable(): Observable<T>;
    result(): PipeFnResult<T>;
}

type MaybeCancellingReadProvider<T, B extends boolean> = B extends true
    ? CancellingReadProvider<T>
    : ContinuingReadProvider<T>;

export class Read<T, Cancelling extends boolean = false>
    implements InteropObservable<T>, Subscribable<T>
{
    public constructor(
        private provider: MaybeCancellingReadProvider<T, Cancelling>
    ) {}

    public [Symbol.observable](): Subscribable<T> {
        return this;
    }

    public subscribe(observer: Partial<Observer<T>>): Unsubscribable {
        return this.provider.observable().subscribe(observer);
    }

    public get value(): MaybeUndefined<T, Cancelling> {
        return this.provider.result().value as MaybeUndefined<T, Cancelling>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public pipe<Operators extends PipeOperator<any, any>[]>(
        ...operators: OperatorPipeline<T, Operators>
    ): Read<
        ReturnTypeOfTailOperator<Operators>,
        And<Cancelling | ContainsCancellingPipeOperator<Operators>>
    > {
        const provider = this.provider;
        return new Read<ReturnTypeOfTailOperator<Operators>, any>({
            observable(): Observable<ReturnTypeOfTailOperator<Operators>> {
                return (
                    provider
                        .observable()
                        /* the pipe function does provide a rest parameter implementation,
                         TS just cannot find it for some reason
                         @ts-expect-error */
                        .pipe(...operators.map((it) => it.observableOperator))
                );
            },
            result(): PipeFnResult<ReturnTypeOfTailOperator<Operators>> {
                const result = provider.result();
                if (result.type === 'cancel') {
                    return result;
                }

                return pipe(...operators.map((it) => it.valueOperator))(
                    result.value
                );
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
            result(): PipeFnNext<T> {
                return { type: 'next', value: query.getValue() };
            },
        });
    } else if (typeof keyOrProjection === 'function') {
        return new Read<unknown>({
            observable(): Observable<unknown> {
                return query.select(keyOrProjection);
            },
            result(): PipeFnNext<unknown> {
                return {
                    type: 'next',
                    value: keyOrProjection(query.getValue()),
                };
            },
        });
    } else {
        return new Read<T[K]>({
            observable(): Observable<T[K]> {
                return query.select(keyOrProjection);
            },
            result(): PipeFnNext<T[K]> {
                return {
                    type: 'next',
                    value: query.getValue()[keyOrProjection],
                };
            },
        });
    }
}
