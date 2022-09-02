import { SchedulerLike, shareReplay as RxShareReplay } from 'rxjs';
import { ContinuingPipeOperator } from '../util/pipe.operator';
import { identityValueOperator } from './identity-value-operator.util';

// type from `rxjs/shareReplay`
export interface ShareReplayConfig {
  bufferSize?: number;
  windowTime?: number;
  refCount: boolean;
  scheduler?: SchedulerLike;
}

export function shareReplay<T>(
  config?: ShareReplayConfig
): ContinuingPipeOperator<T, T> {
  return {
    observableOperator:
      config == null ? RxShareReplay() : RxShareReplay(config),
    valueOperator: identityValueOperator,
  };
}
