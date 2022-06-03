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
import { AnyToUnknown } from './util/any-to-unknown';
import {
    ContainsCancellingPipeOperator,
    PipeOperator,
} from './util/pipe.operator';
import { And, MaybeUndefined } from './util/type-helpers';

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

class EagerObservableReadProvider<T, Cancelling extends boolean>
    implements CancellingReadProvider<T>
{
    private readonly obs: Observable<T>;

    public constructor(
        private readonly provider: MaybeCancellingReadProvider<T, Cancelling>
    ) {
        this.obs = this.provider.observable();
    }

    public observable(): Observable<T> {
        return this.obs;
    }

    public result(): PipeFnResult<T> {
        return this.provider.result();
    }
}

export class Read<T, Cancelling extends boolean = false>
    implements InteropObservable<T>, Subscribable<T>
{
    public readonly provider: MaybeCancellingReadProvider<T, Cancelling>;

    public constructor(provider: MaybeCancellingReadProvider<T, Cancelling>) {
        this.provider = new EagerObservableReadProvider<T, Cancelling>(
            provider
        ) as MaybeCancellingReadProvider<T, Cancelling>;
    }

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
        // change any to unknown to avoid issues when the ReturnType inference does not work completely
        AnyToUnknown<ReturnTypeOfTailOperator<Operators>>,
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
