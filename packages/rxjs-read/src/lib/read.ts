import {InteropObservable, Observable, Observer, Subscribable, Unsubscribable} from 'rxjs';
import {OperatorPipeline, ReturnTypeOfTailOperator} from './operators/operator.types';
import {pipe, PipeFnResult} from './pipe/pipe';
import {EagerObservableReadProvider, MaybeCancellingReadProvider} from './read-providers';
import {AnyToUnknown} from './util/any-to-unknown';
import {ContainsCancellingPipeOperator, PipeOperator} from './util/pipe.operator';
import {And, MaybeUndefined} from './util/type-helpers';

/**
 * The Read is the core class available in this library.
 * It represents a reactive value that can also be calculated synchronously.
 *
 * A Read is interoperable with {@link rxjs!Observable | Observables} of RxJS.
 * You can pass a Read to any RxJS method and it will act as if it is a Observable.
 *
 * ```ts
 * import { combineLatest } from 'rxjs';
 *
 * declare const read: Read<string>;
 * declare const observable: Observable<number>;
 *
 * const combined: Observable<number, string> = combineLatest(observable, read);
 * ```
 *
 * @typeParam T type of the value
 * @typeParam Cancelling represents if the Read is a cancelling Read or not
 */
export class Read<T, Cancelling extends boolean = false> implements InteropObservable<T>, Subscribable<T> {
    /**
     * The provider is the unit which actually provides the reactive and synchronous implementation of a Read.
     * It is normally only used in {@link PipeOperator | PipeOperators} to directly modify the pipped value.
     */
    public readonly provider: MaybeCancellingReadProvider<T, Cancelling>;

    /**
     * Normally you would not create a new Read directly using its constructor,
     * but rather use the existing selector functions like {@link readOf}.
     *
     * If that does not cover your needs you can create a new Read using this constructor.
     * The passed provider will be used as source of the reactive and synchronous values.
     *
     * @typeParam T type of the value
     * @typeParam Cancelling represents if the Read is a cancelling Read or not
     * @param provider provider to use for reactive and synchronous values
     */
    public constructor(provider: MaybeCancellingReadProvider<T, Cancelling>) {
        // needed because of the limitations of typescript
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.provider = new EagerObservableReadProvider<T, Cancelling>(provider) as MaybeCancellingReadProvider<T, Cancelling>;
    }

    /**
     * @internal
     */
    public [Symbol.observable](): Subscribable<T> {
        return this;
    }

    /**
     * Subscribe to the reactive value of the Read.
     *
     * @param observer Observer handling the emitted values
     * @return Returns a Unsubscribable to cancel the subscription
     */
    public subscribe(observer: Partial<Observer<T>>): Unsubscribable {
        return this.provider.observable().subscribe(observer);
    }

    /**
     * Calculate the current value synchronously.
     *
     * If the Read is a cancelling Read the value might be undefined,
     * because some operator along the pipe-chain canceled the calculation.
     *
     * @return Returns the computed value or undefined if the Read is cancelling
     */
    public get value(): MaybeUndefined<T, Cancelling> {
        // needed because of the limitations of typescript
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return this.provider.result().value as MaybeUndefined<T, Cancelling>;
    }

    /**
     * Create a new Read based on this one by creating a pipeline from the passed {@link PipeOperator | PipeOperators}
     * and using it to mutated the emitted or synchronously computed value.
     *
     * :warning: If any of the PipeOperators in the pipeline is a {@link CancellingPipeOperator},
     * then the new Read will be a cancelling Read. :warning:
     *
     * @param operators PipeOperators to use for the pipeline
     * @return Returns a new Read containing the passed pipeline
     */
    public pipe<Operators extends PipeOperator<any, any>[]>(
        ...operators: OperatorPipeline<T, Operators>
    ): Read<
        // change any to unknown to avoid issues when the ReturnType inference does not work completely
        AnyToUnknown<ReturnTypeOfTailOperator<Operators>>,
        And<Cancelling | ContainsCancellingPipeOperator<Operators>>
    > {
        const provider = this.provider;

        return new Read<ReturnTypeOfTailOperator<Operators>, boolean>({
            observable(): Observable<ReturnTypeOfTailOperator<Operators>> {
                return (
                    provider
                        .observable()
                        /* the pipe function does provide a rest parameter implementation,
                         TS just cannot find it for some reason
                         @ts-expect-error */
                        .pipe<ReturnTypeOfTailOperator<Operators>>(...operators.map((it) => it.observableOperator))
                );
            },
            result(): PipeFnResult<ReturnTypeOfTailOperator<Operators>> {
                const result = provider.result();
                if (result.type === 'cancel') {
                    return result;
                }

                return pipe(...operators.map((it) => it.valueOperator))(result.value);
            },
        });
    }
}
