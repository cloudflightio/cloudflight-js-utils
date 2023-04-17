import {BehaviorSubject, Observable} from 'rxjs';
import {PipeFnNext} from './pipe/pipe';
import {Read} from './read';

/**
 * Create a new {@link Read} reading the state of a {@link rxjs!BehaviorSubject | BehaviorSubject}:
 *
 * ```ts
 * const subjectState$: Read<string> = readFrom(behaviorSubject);
 * ```
 *
 * @group Selectors
 * @typeParam T state used by the `target`
 * @param subject$ Query or BehaviorSubject to select from
 * @return Returns a new {@link Read} that emits the state of the BehaviorSubject
 */
export function readFrom<T>(subject$: BehaviorSubject<T>): Read<T> {
    return new Read<T>({
        observable(): Observable<T> {
            return subject$.asObservable();
        },
        result(): PipeFnNext<T> {
            return {
                type: 'next',
                get value() {
                    return subject$.getValue();
                },
            };
        },
    });
}
