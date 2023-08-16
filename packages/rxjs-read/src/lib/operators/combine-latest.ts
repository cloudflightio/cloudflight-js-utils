import {combineLatest as RxCombineLatest, Observable} from 'rxjs';
import {PipeFnResult} from '../pipe/pipe';
import {Read} from '../read';
import {ContainsCancellingRead} from '../util/is-cancelling-read';

type ReturnTypesOf<R extends Read<any, any>[]> = {
    [T in keyof R]: R[T] extends Read<infer Return, any> ? Return : never;
};

/**
 * Combines the latest results of all passed {@link Read | Reads}.
 *
 * ```ts
 * // without a cancelling Read
 * declare const read1: Read<string>;
 * declare const read2: Read<number>;
 * const read: Read<[string, number]> = combineLatest([read1, read2]);
 * ```
 *
 * ```ts
 * // with a cancelling Read
 * declare const read1: Read<string>;
 * declare const read2: Read<number, true>;
 * const read: Read<[string, number], true> = combineLatest([read1, read2]);
 * ```
 *
 * **Observable Behavior:**
 *
 * Works exactly like {@link rxjs!combineLatest | combineLatest} of RxJS.
 *
 * **Sync Behavior:**
 *
 * Retrieves sync value of passed Reads. If one of those Reads cancels the read the result will be canceled.
 *
 * @group Operators
 * @param reads Reads to combine
 * @return Returns a new combined Read
 */
export function combineLatest<I extends Read<unknown, boolean>[]>(
    reads: readonly [...I],
): Read<ReturnTypesOf<I>, ContainsCancellingRead<I>> {
    return new Read<ReturnTypesOf<I>, boolean>({
        observable(): Observable<ReturnTypesOf<I>> {
            // needed because of the limitations of typescript
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return RxCombineLatest(reads) as unknown as Observable<ReturnTypesOf<I>>;
        },
        result(): PipeFnResult<ReturnTypesOf<I>> {
            const results = reads.map((read) => read.provider.result());
            if (results.some((result) => result.type === 'cancel')) {
                return {
                    type: 'cancel',
                    value: undefined,
                };
            }

            return {
                type: 'next',
                // needed because of the limitations of typescript
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                value: results.map((result) => result.value) as unknown as ReturnTypesOf<I>,
            };
        },
    });
}
