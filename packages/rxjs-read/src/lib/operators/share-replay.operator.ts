import {shareReplay as RxShareReplay, ShareReplayConfig} from 'rxjs';
import {ContinuingPipeOperator} from '../util/pipe.operator';
import {identityValueOperator} from './identity-value-operator.util';

/**
 * Share the source and replay specified number of emissions on subscription.
 *
 * ```ts
 * declare const read1: Read<string>;
 * const read: Read<string> = read1.pipe(
 *   shareReplay<string>({ bufferSize: 1, refCount: true })
 * );
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!shareReplay | shareReplay} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Has no effect on sync calls. The value is just passed through.
 *
 * @group Operators
 * @typeParam T type of the value
 * @param config optional configuration on how to share the source
 */
export function shareReplay<T>(config?: ShareReplayConfig): ContinuingPipeOperator<T, T> {
    return {
        observableOperator: config == null ? RxShareReplay() : RxShareReplay(config),
        valueOperator: identityValueOperator,
    };
}
