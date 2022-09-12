import { Query } from '@datorama/akita';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Read,
  PipeFnNext,
  readFrom as rxjsReadFrom,
} from '@cloudflight/rxjs-read';

type Projection<T, P = unknown> = (state: T) => P;

export function readFrom<T, K extends keyof T>(
  query: Query<T>,
  key: K
): Read<T[K]>;
export function readFrom<T, P>(
  query: Query<T>,
  project: (state: T) => P
): Read<P>;
export function readFrom<T, K extends keyof T>(
  query: Query<T>,
  keys: readonly K[]
): Read<Pick<T, K>>;
export function readFrom<T>(query: Query<T> | BehaviorSubject<T>): Read<T>;
export function readFrom<T, K extends keyof T>(
  query: Query<T> | BehaviorSubject<T>,
  project?: K | Projection<T> | K[]
): Read<T | T[K] | unknown> {
  if (query instanceof BehaviorSubject) {
    return rxjsReadFrom(query);
  } else if (project == null) {
    return new Read<T>({
      observable(): Observable<T> {
        return query.select();
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
  } else if (typeof project === 'function') {
    return new Read<unknown>({
      observable(): Observable<unknown> {
        return query.select(project);
      },
      result(): PipeFnNext<unknown> {
        return {
          type: 'next',
          get value() {
            return project(query.getValue());
          },
        };
      },
    });
  } else if (Array.isArray(project)) {
    return new Read<Pick<T, K>>({
      observable(): Observable<Pick<T, K>> {
        return query.select(project);
      },
      result(): PipeFnNext<Pick<T, K>> {
        return {
          type: 'next',
          get value(): Pick<T, K> {
            const value = query.getValue();
            return project.reduce(
              (selection, key) =>
                Object.assign(selection, { [key]: value[key] }),
              {} as Partial<Pick<T, K>>
            ) as Pick<T, K>;
          },
        };
      },
    });
  } else {
    return new Read<T[K]>({
      observable(): Observable<T[K]> {
        return query.select(project);
      },
      result(): PipeFnNext<T[K]> {
        return {
          type: 'next',
          value: query.getValue()[project],
        };
      },
    });
  }
}
