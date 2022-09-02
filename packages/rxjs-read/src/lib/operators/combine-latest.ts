import { combineLatest as RxCombineLatest, Observable } from 'rxjs';
import { PipeFnResult } from '../pipe/pipe';
import { Read } from '../read';
import { ContainsCancellingRead } from '../util/is-cancelling-read';

type ReturnTypesOf<R extends Read<any, any>[]> = {
  [T in keyof R]: R[T] extends Read<infer Return, any> ? Return : never;
};

export function combineLatest<I extends Read<any, any>[]>(
  reads: readonly [...I]
): Read<ReturnTypesOf<I>, ContainsCancellingRead<I>> {
  return new Read<ReturnTypesOf<I>, any>({
    observable(): Observable<ReturnTypesOf<I>> {
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
        value: results.map(
          (result) => result.value
        ) as unknown as ReturnTypesOf<I>,
      };
    },
  });
}
