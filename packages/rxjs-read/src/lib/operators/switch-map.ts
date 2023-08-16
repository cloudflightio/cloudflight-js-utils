import {ObservedValueOf, OperatorFunction, switchMap as RxSwitchMap} from 'rxjs';
import {PipeFnResult} from '../pipe/pipe';
import {Read} from '../read';
import {IsCancellingRead} from '../util/is-cancelling-read';
import {MaybeCancellingPipeOperator} from '../util/pipe.operator';
import {ReadReturn} from '../util/read-return';

/**
 * Maps a value to a different {@link Read} using the switchMapFn.
 *
 * ```ts
 * // without cancelling reads
 * declare const read1: Read<string>;
 * declare const mappedRead: Read<number>;
 * const read: Read<number> = read1.pipe(
 *   switchMap((value: string) => mappedRead)
 * );
 * ```
 *
 * ```ts
 * // with cancelling source read
 * declare const read1: Read<string, true>;
 * declare const mappedRead: Read<number>;
 * const read: Read<number, true> = read1.pipe(
 *   switchMap((value: string) => mappedRead)
 * );
 * ```
 *
 * ```ts
 * // with cancelling mapped read
 * declare const read1: Read<string>;
 * declare const mappedRead: Read<number, true>;
 * const read: Read<number, true> = read1.pipe(
 *   switchMap((value: string) => mappedRead)
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!switchMap | switchMap} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Maps the current value to a new Read using its sync value to continue or cancel the chain.
 *
 * @group Operators
 * @typeParam I type of the input value
 * @typeParam R type of the return value
 * @param switchMapFn function used to map the value to a Read
 */
export function switchMap<I, R extends Read<unknown, boolean>>(
    switchMapFn: (value: I) => R,
): MaybeCancellingPipeOperator<I, ReadReturn<R>, IsCancellingRead<R>> {
    // extracted the functions to be as type safe as possible
    function valueMap(value: I): PipeFnResult<ReadReturn<R>> {
        const mappedRead = switchMapFn(value);
        // @ts-expect-error needed because of the limitations of typescript
        return mappedRead.provider.result();
    }
    const observableOperator: OperatorFunction<I, ObservedValueOf<R>> = RxSwitchMap(switchMapFn);

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
        observableOperator,
        valueOperator: valueMap,
    } as MaybeCancellingPipeOperator<I, ReadReturn<R>, IsCancellingRead<R>>;
}
