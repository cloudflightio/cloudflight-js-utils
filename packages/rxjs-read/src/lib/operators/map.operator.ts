import {map as RxMap} from 'rxjs';
import {ContinuingPipeOperator} from '../util/pipe.operator';
import {UnaryFn} from '../util/type-helpers';

/**
 * Maps a value to a different one using the mapFn.
 *
 * ```ts
 * declare const read1: Read<string>;
 * const read: Read<number> = read1.pipe(
 *   map((value: string) => Number.parseInt(value))
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!map | map} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Maps the current value to a new value using the mapFn
 *
 * @group Operators
 * @typeParam I type of the input value
 * @typeParam R type of the return value
 * @param mapFn function used to map the value
 */
export function map<I, R>(mapFn: UnaryFn<I, R>): ContinuingPipeOperator<I, R> {
    return {
        observableOperator: RxMap(mapFn),
        valueOperator: (value: I) => ({
            type: 'next',
            value: mapFn(value),
        }),
    };
}
