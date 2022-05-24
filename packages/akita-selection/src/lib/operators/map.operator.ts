import { map as RxMap } from 'rxjs';
import { UnaryFn } from '../type-helpers';
import { ContinuingPipeOperator } from '../util/pipe.operator';

export function map<I, R>(fn: UnaryFn<I, R>): ContinuingPipeOperator<I, R> {
    return {
        observableOperator: RxMap(fn),
        valueOperator: (value: I) => ({
            type: 'next',
            value: fn(value),
        }),
    };
}
