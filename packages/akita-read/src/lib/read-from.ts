import {Query} from '@datorama/akita';
import {BehaviorSubject, Observable} from 'rxjs';
import {PipeFnNext, Read, readFrom as rxjsReadFrom} from '@cloudflight/rxjs-read';

type Projection<T, P = unknown> = (state: T) => P;

/**
 * Create a new {@link Read} containing the whole state of the Store using a {@link @datorama/akita!Query | Query}
 * or reading the state of a {@link rxjs!BehaviorSubject | BehaviorSubject}:
 *
 * ```ts
 * const state$: Read\<StoreState\> = readFrom(query);
 * const subjectState$: Read\<string\> = readFrom(behaviorSubject);
 * ```
 *
 * @group Selectors
 * @typeParam T state used by the `target`
 * @param target Query or BehaviorSubject to select from
 * @return Returns a new {@link Read} that emits the state of the Query or BehaviorSubject
 */
export function readFrom<T>(target: Query<T> | BehaviorSubject<T>): Read<T>;
/**
 * Create a new {@link Read} by selecting a key from the Store using a {@link @datorama/akita!Query | Query}:
 *
 * ```ts
 * const date$: Read\<Date\> = readFrom(query, 'date');
 * ```
 *
 * @group Selectors
 * @typeParam T state used by the query
 * @typeParam K key of the state
 * @param query Query to select from
 * @param key key to select from the state
 * @return Returns a new {@link Read} that emits the value of the selected field of the state
 */
export function readFrom<T, K extends keyof T>(query: Query<T>, key: K): Read<T[K]>;
/**
 * Create a new {@link Read} using a projection from the Store using a {@link @datorama/akita!Query | Query}:
 *
 * ```ts
 * const date$: Read\<Date\> = readFrom(query, state => state.date);
 * ```
 *
 * :warning: Avoid doing heavy calculations inside the projection. :warning:
 *
 * > The result of the projection is automatically piped through a `distinctUntilChanged`
 * > operator to avoid unnecessary recalculations/emissions.
 * > ```ts
 * > const sum$: Read\<number\> = readFrom(query, state => state.prices.reduce((sum, curr) => sum + curr, 0));
 * > ```
 * > By doing this calculation inside the projection, this calculation is always redone when the state changes,
 * > even though the prices did not change at all.
 *
 * @group Selectors
 * @typeParam T state used by the query
 * @typeParam P return type of the projection
 * @param query Query to select from
 * @param projection projection to pick from the state
 * @return Returns a new {@link Read} that emits the value returned by the projection
 */
export function readFrom<T, P>(query: Query<T>, projection: (state: T) => P): Read<P>;
/**
 * Create a new {@link Read} by selecting a list of keys from the Store using a {@link @datorama/akita!Query | Query}:
 *
 * ```ts
 * const data$: Read\<{date: Date, count: number}\> = readFrom(query, ['date', 'count']);
 * ```
 *
 * @group Selectors
 * @typeParam T state used by the query
 * @typeParam K key of the state
 * @param query Query to select from
 * @param keys array of keys to select from the state
 * @return Returns a new {@link Read} that emits an object containing the values selected by the keys
 */
export function readFrom<T, K extends keyof T>(query: Query<T>, keys: readonly K[]): Read<Pick<T, K>>;
/**
 * @internal
 */
export function readFrom<T, K extends keyof T>(
    query$: Query<T> | BehaviorSubject<T>,
    projection?: K | Projection<T> | K[],
    // `unknown` is not redundant
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): Read<T | T[K] | unknown> {
    if (query$ instanceof BehaviorSubject) {
        return rxjsReadFrom(query$);
    } else if (projection == null) {
        return new Read<T>({
            observable(): Observable<T> {
                return query$.select();
            },
            result(): PipeFnNext<T> {
                return {
                    type: 'next',
                    get value() {
                        return query$.getValue();
                    },
                };
            },
        });
    } else if (typeof projection === 'function') {
        return new Read<unknown>({
            observable(): Observable<unknown> {
                return query$.select(projection);
            },
            result(): PipeFnNext<unknown> {
                return {
                    type: 'next',
                    get value() {
                        return projection(query$.getValue());
                    },
                };
            },
        });
    } else if (Array.isArray(projection)) {
        return new Read<Pick<T, K>>({
            observable(): Observable<Pick<T, K>> {
                return query$.select(projection);
            },
            result(): PipeFnNext<Pick<T, K>> {
                return {
                    type: 'next',
                    get value(): Pick<T, K> {
                        const value = query$.getValue();
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        return projection.reduce<Partial<Pick<T, K>>>(
                            (selection, key) => Object.assign(selection, {[key]: value[key]}),
                            {},
                        ) as Pick<T, K>;
                    },
                };
            },
        });
    }

    return new Read<T[K]>({
        observable(): Observable<T[K]> {
            return query$.select(projection);
        },
        result(): PipeFnNext<T[K]> {
            return {
                type: 'next',
                value: query$.getValue()[projection],
            };
        },
    });
}
