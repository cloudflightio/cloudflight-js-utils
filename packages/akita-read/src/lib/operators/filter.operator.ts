import { filter as RxFilter } from 'rxjs';
import { CancellingPipeOperator } from '../util/pipe.operator';

export function filter<T>(
    filter: (value: T) => boolean
): CancellingPipeOperator<T, T> {
    return {
        observableOperator: RxFilter(filter),
        valueOperator: (value: T) => {
            if (filter(value)) {
                return {
                    type: 'next',
                    value: value,
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
