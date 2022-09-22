import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { skip as RxSkip } from 'rxjs/operators';
import { identityValueOperator } from './identity-value-operator.util';

/**
 * Skip a specified number of emissions.
 *
 * ```ts
 * declare const read1: Read<string>;
 * const read: Read<string> = read1.pipe(
 *   skip<string>(1)
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!skip | skip} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Has no effect on sync calls. The value is just passed through.
 *
 * @group Operators
 * @typeParam T type of the value
 * @param count number of skipped emissions
 */
export function skip<T>(count: number): MaybeCancellingPipeOperator<T, T> {
  return {
    observableOperator: RxSkip(count),
    valueOperator: identityValueOperator,
  };
}
