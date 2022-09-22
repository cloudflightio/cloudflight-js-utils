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

/**
 * Combines the latest result of the passed {@link Read}.
 *
 * ```ts
 * // without a cancelling Read
 * declare const read1: Read<string>;
 * declare const read2: Read<number>;
 * const read: Read<[string, number]> = read1.pipe(
 *   withLatestFrom<string, typeof read2>(read2)
 * );
 * ```
 *
 * ```ts
 * // with a cancelling Read
 * declare const read1: Read<string>;
 * declare const read2: Read<number, true>;
 * const read: Read<[string, number], true> = read1.pipe(
 *   withLatestFrom<string, typeof read2>(read2)
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!withLatestFrom | withLatestFrom} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Retrieves sync value of passed Read. If the passed read canceled the chain, then the chain will be canceled.
 *
 * @group Operators
 * @param read Read to combine
 */
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
