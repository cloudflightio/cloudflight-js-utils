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

export interface ContinuingReadProvider<T> {
    observable(): Observable<T>;

    result(): PipeFnNext<T>;
}

export interface CancellingReadProvider<T> {
    observable(): Observable<T>;

    result(): PipeFnResult<T>;
}

export type MaybeCancellingReadProvider<T, B extends boolean> = B extends true
    ? CancellingReadProvider<T>
    : ContinuingReadProvider<T>;

export class Read<T, Cancelling extends boolean = false>
    implements InteropObservable<T>, Subscribable<T>
{
    public constructor(
        public readonly provider: MaybeCancellingReadProvider<T, Cancelling>
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
