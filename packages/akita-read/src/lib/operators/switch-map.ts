import {
    ObservedValueOf,
    OperatorFunction,
    switchMap as RxSwitchMap,
} from 'rxjs';
import { PipeFnResult } from '../pipe/pipe';
import { Read } from '../read';
import { IsCancellingRead } from '../util/is-cancelling-read';
import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { ReadReturn } from '../util/read-return';

export function switchMap<I, R extends Read<any, any>>(
    switchMap: (value: I) => R
): MaybeCancellingPipeOperator<I, ReadReturn<R>, IsCancellingRead<R>> {
    // extracted the functions to be as type safe as possible
    function valueMap(value: I): PipeFnResult<ReadReturn<R>> {
        const mappedRead = switchMap(value);
        return mappedRead.provider.result();
    }
    const observableOperator: OperatorFunction<
        I,
        ObservedValueOf<R>
    > = RxSwitchMap(switchMap);

    return {
        observableOperator,
        valueOperator: valueMap,
    } as MaybeCancellingPipeOperator<I, ReadReturn<R>, IsCancellingRead<R>>;
}
