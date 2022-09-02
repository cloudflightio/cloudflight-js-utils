import { filter as RxFilter } from 'rxjs';
import { CancellingPipeOperator } from '../util/pipe.operator';

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
