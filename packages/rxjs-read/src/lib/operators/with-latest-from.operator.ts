import {
  ObservedValueOf,
  OperatorFunction,
  withLatestFrom as RxWithLatestFrom,
} from 'rxjs';
import { PipeFnResult } from '../pipe/pipe';
import { Read } from '../read';
import { IsCancellingRead } from '../util/is-cancelling-read';
import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { ReadReturn } from '../util/read-return';

export function withLatestFrom<I, R extends Read<any, any>>(
  read: R
): MaybeCancellingPipeOperator<I, [I, ReadReturn<R>], IsCancellingRead<R>> {
  function valueLatestFrom(value: I): PipeFnResult<[I, ReadReturn<R>]> {
    const other = read.provider.result();

    if (other.type === 'cancel') {
      return {
        type: 'cancel',
        value: undefined,
      };
    }

    return {
      type: 'next',
      value: [value, other.value],
    };
  }
  const observableOperator: OperatorFunction<I, [I, ObservedValueOf<R>]> =
    RxWithLatestFrom(read);

  return {
    observableOperator,
    valueOperator: valueLatestFrom,
  } as MaybeCancellingPipeOperator<I, [I, ReadReturn<R>], IsCancellingRead<R>>;
}
