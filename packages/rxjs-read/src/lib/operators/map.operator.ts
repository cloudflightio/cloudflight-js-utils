import { map as RxMap } from 'rxjs';
import { ContinuingPipeOperator } from '../util/pipe.operator';
import { UnaryFn } from '../util/type-helpers';

export function map<I, R>(fn: UnaryFn<I, R>): ContinuingPipeOperator<I, R> {
  return {
    observableOperator: RxMap(fn),
    valueOperator: (value: I) => ({
      type: 'next',
      value: fn(value),
    }),
  };
}
