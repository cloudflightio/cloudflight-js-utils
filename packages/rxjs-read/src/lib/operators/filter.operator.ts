import { filter as RxFilter } from 'rxjs';
import { CancellingPipeOperator } from '../util/pipe.operator';

/**
 * Prevents emission of a value in the observable chain, if the value does not pass the test in the filterFn.
 *
 * ```ts
 * declare const read1: Read<string>;
 * const read: Read<string, true> = read1.pipe(
 *   filter((value: string) => value !== 'allowed')
 * );
 * ```
 *
 * Using this operator in a chain, results in the resulting {@link Read} to be a cancelling Read.
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!filter | filter} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Checks the value with the filterFn. If it passes the check the chain will continue, if not it will be canceled.
 *
 * @group Operators
 * @typeParam T type of the value
 * @param filterFn function used for filtering
 */
export function filter<T>(
  filterFn: (value: T) => boolean
): CancellingPipeOperator<T, T> {
  return {
    observableOperator: RxFilter(filterFn),
    valueOperator: (value: T) => {
      if (filterFn(value)) {
        return {
          type: 'next',
          value,
        };
      } else {
        return {
          type: 'cancel',
          value: undefined,
        };
      }
    },
  };
}
