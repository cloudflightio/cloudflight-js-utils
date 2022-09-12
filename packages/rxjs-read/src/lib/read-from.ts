import { BehaviorSubject, Observable } from 'rxjs';
import { PipeFnNext } from './pipe/pipe';
import { Read } from './read';

export function readFrom<T>(query: BehaviorSubject<T>): Read<T> {
  return new Read<T>({
    observable(): Observable<T> {
      return query.asObservable();
    },
    result(): PipeFnNext<T> {
      return {
        type: 'next',
        get value() {
          return query.getValue();
        },
      };
    },
  });
}
