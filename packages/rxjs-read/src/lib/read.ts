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
import { pipe, PipeFnResult } from './pipe/pipe';
import {
  EagerObservableReadProvider,
  MaybeCancellingReadProvider,
} from './read-providers';
import { AnyToUnknown } from './util/any-to-unknown';
import {
  ContainsCancellingPipeOperator,
  PipeOperator,
} from './util/pipe.operator';
import { And, MaybeUndefined } from './util/type-helpers';

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

        return pipe(...operators.map((it) => it.valueOperator))(result.value);
      },
    });
  }
}
