import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { Observable } from 'rxjs';
import { takeUntil as RxTakeUntil } from 'rxjs/operators';
import { identityValueOperator } from './identity-value-operator.util';

/**
 * Emit values until the passed {@link rxjs!Observable | Observable} emits.
 *
 * ```ts
 * declare const read1: Read<string>;
 * declare const until$: Observable<unknown>;
 * const read: Read<string> = read1.pipe(
 *   takeUntil<string>(until$)
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!takeUntil | takeUntil} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Has no effect on sync calls. The value is just passed through.
 *
 * @group Operators
 * @typeParam T type of the value
 * @param until Observable to cancel emissions
 */
export function takeUntil<T>(
  until: Observable<unknown>
): MaybeCancellingPipeOperator<T, T> {
  return {
    observableOperator: RxTakeUntil(until),
    valueOperator: identityValueOperator,
  };
}
