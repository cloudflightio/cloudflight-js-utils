import { combineLatest as RxCombineLatest, Observable } from 'rxjs';
import { PipeFnResult } from './pipe/pipe';
import { Read } from './read';
import { And } from './type-helpers';

type ReturnTypesOf<R extends Read<any, any>[]> = {
    [T in keyof R]: R[T] extends Read<infer Return, any> ? Return : never;
};

type IsCancellingRead<T extends Read<any, any>> = T extends Read<any, infer R>
    ? R
    : never;

export type ContainsCancellingRead<
    Operators extends Read<any, any>[],
    Length extends number = Operators['length']
> = Length extends 1
    ? IsCancellingRead<Operators[0]>
    : Operators extends [infer First, ...infer Rest]
    ? First extends Read<any, any>
        ? Rest extends Read<any, any>[]
            ? And<IsCancellingRead<First> | ContainsCancellingRead<Rest>>
            : never
        : never
    : never;

export function combineLatest<I extends Read<any, any>[]>(
    reads: readonly [...I]
): Read<ReturnTypesOf<I>, ContainsCancellingRead<I>> {
    return new Read<ReturnTypesOf<I>, any>({
        observable(): Observable<ReturnTypesOf<I>> {
            return RxCombineLatest(reads) as unknown as Observable<
                ReturnTypesOf<I>
            >;
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
                value: results.map(
                    (result) => result.value
                ) as unknown as ReturnTypesOf<I>,
            };
        },
    });
}
