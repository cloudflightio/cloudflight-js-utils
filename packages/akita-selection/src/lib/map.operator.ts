import { map as RxMap } from 'rxjs';
import { Fn, PipeOperator } from './type-helpers';

export function map<I, R>(fn: Fn<I, R>): PipeOperator<I, R> {
    return {
        observableOperator: RxMap(fn),
        valueOperator: fn,
    };
}
