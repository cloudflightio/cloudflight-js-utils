import { Observable, of } from 'rxjs';
import { PipeFnNext } from './pipe/pipe';
import { Read } from './read';

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
