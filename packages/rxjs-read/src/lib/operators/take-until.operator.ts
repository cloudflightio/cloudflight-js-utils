import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { Observable } from 'rxjs';
import { takeUntil as RxTakeUntil } from 'rxjs/operators';
import { identityValueOperator } from './identity-value-operator.util';

export function takeUntil<I>(
  until: Observable<unknown>
): MaybeCancellingPipeOperator<I, I> {
  return {
    observableOperator: RxTakeUntil(until),
    valueOperator: identityValueOperator,
  };
}
