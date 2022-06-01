import { distinctUntilChanged as RxDistinctUntilChanged } from 'rxjs';
import { ContinuingPipeOperator } from '../util/pipe.operator';

export function distinctUntilChanged<T>(
    comparator?: (previous: T, current: T) => boolean
): ContinuingPipeOperator<T, T> {
    return {
        observableOperator: RxDistinctUntilChanged(comparator),
        valueOperator: (value: T) => {
            return {
                type: 'next',
                value,
            };
        },
    };
}
