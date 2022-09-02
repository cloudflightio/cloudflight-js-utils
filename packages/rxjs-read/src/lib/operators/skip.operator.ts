import { MaybeCancellingPipeOperator } from '../util/pipe.operator';
import { skip as RxSkip } from 'rxjs/operators';
import { identityValueOperator } from './identity-value-operator.util';

export function skip<I>(count: number): MaybeCancellingPipeOperator<I, I> {
  return {
    observableOperator: RxSkip(count),
    valueOperator: identityValueOperator,
  };
}
