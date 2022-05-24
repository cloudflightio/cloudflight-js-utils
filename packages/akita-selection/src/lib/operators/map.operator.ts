import { map as RxMap } from 'rxjs';
import { UnaryFn } from '../type-helpers';
import { PipeOperator } from './operator.types';

export function map<I, R>(fn: UnaryFn<I, R>): PipeOperator<I, R> {
    return {
        observableOperator: RxMap(fn),
        valueOperator: fn,
    };
}
