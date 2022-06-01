import { distinctUntilChanged as RxDistinctUntilChanged } from 'rxjs';
import { ContinuingPipeOperator } from '../util/pipe.operator';
import { identityValueOperator } from './identity-value-operator.util';

export function distinctUntilChanged<T>(
    comparator?: (previous: T, current: T) => boolean
): ContinuingPipeOperator<T, T> {
    return {
        observableOperator: RxDistinctUntilChanged(comparator),
        valueOperator: identityValueOperator,
    };
}
