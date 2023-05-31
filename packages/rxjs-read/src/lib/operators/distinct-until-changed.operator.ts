import {distinctUntilChanged as RxDistinctUntilChanged} from 'rxjs';
import {ContinuingPipeOperator} from '../util/pipe.operator';
import {identityValueOperator} from './identity-value-operator.util';

/**
 * Prevents emission of a value in the observable chain, if the value did not change.
 *
 * ```ts
 * declare const read1: Read<string>;
 * const read: Read<string> = read1.pipe(
 *   distinctUntilChanged<string>()
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!distinctUntilChanged | distinctUntilChanged} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Has no effect on sync calls. The value is just passed through.
 *
 * @group Operators
 * @typeParam T type of the value
 * @param comparator optionally pass a comparator function to use.
 */
export function distinctUntilChanged<T>(comparator?: (previous: T, current: T) => boolean): ContinuingPipeOperator<T, T> {
    return {
        observableOperator: RxDistinctUntilChanged(comparator),
        valueOperator: identityValueOperator,
    };
}
