import {Observable, of} from 'rxjs';
import {PipeFnNext} from './pipe/pipe';
import {Read} from './read';

/**
 * Create a new {@link Read} representing one value. Like {@link rxjs!of | of} from `rxjs`.
 *
 * ```ts
 * const value$: Read<string> = readOf('value');
 * ```
 *
 * @group Selectors
 * @typeParam T type of the value
 * @param value value to be contained by the Read
 * @return Returns a new {@link Read} representing the passed value.
 */
export function readOf<T>(value: T): Read<T> {
    return new Read<T>({
        observable(): Observable<T> {
            return of(value);
        },
        result(): PipeFnNext<T> {
            return {
                type: 'next',
                value,
            };
        },
    });
}
