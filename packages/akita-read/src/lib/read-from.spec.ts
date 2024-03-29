import {Read} from '@cloudflight/rxjs-read';
import {EntityState, EntityStore, Query, QueryEntity, Store} from '@datorama/akita';
import {BehaviorSubject, from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {readFrom} from './read-from';
import {beforeEach, describe, expect, it} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('select-from', () => {
    describe('given an Akita Query', () => {
        interface Data {
            value: string;
            count: number;
            unused: string;
        }

        const initial: Data = {
            value: 'test',
            count: 10,
            unused: 'unused',
        };

        const store = new Store<Data>(initial, {name: 'store'});
        const query = new Query(store);

        describe('when creating a new Read for the whole state', () => {
            let read: Read<Data>;

            beforeEach(() => {
                read = readFrom(query);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(initial);
                });
            });
        });

        describe('when creating a new Read for a sub-state using a key', () => {
            let read: Read<number>;

            beforeEach(() => {
                read = readFrom(query, 'count');
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial.count});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(initial.count);
                });
            });
        });

        describe('when creating a new Read for a sub-state using multiple keys', () => {
            let read: Read<Pick<Data, 'count' | 'value'>>;
            const {unused, ...expectedRead} = initial;

            beforeEach(() => {
                read = readFrom(query, ['count', 'value']);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: expectedRead});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(expectedRead);
                });
            });
        });

        describe('when creating a new Read for a sub-state using a projection', () => {
            let read: Read<number>;

            beforeEach(() => {
                read = readFrom(query, (state) => state.count);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial.count});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(initial.count);
                });
            });
        });
    });

    describe('given an Akita QueryEntity', () => {
        interface EntityData {
            id: string;
            value: string;
            count: number;
        }

        interface Data {
            value: number;
        }

        type State = EntityState<EntityData> & Data;

        const initial: Data = {
            value: 50,
        };

        const initialEntity: EntityData = {
            id: 'key',
            value: 'test',
            count: 10,
        };
        const store = new EntityStore<State>(initial, {name: 'store'});
        const query = new QueryEntity(store);
        let expectedState: State;

        beforeEach(() => {
            store.set([initialEntity]);
            expectedState = query.getValue();
        });

        describe('when creating a new Read for the whole state', () => {
            let read: Read<State>;

            beforeEach(() => {
                read = readFrom(query);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: expectedState});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(expectedState);
                });
            });
        });

        describe('when creating a new Read for a sub-state using a key', () => {
            let read: Read<number>;

            beforeEach(() => {
                read = readFrom(query, 'value');
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial.value});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(initial.value);
                });
            });
        });

        describe('when creating a new Read for a sub-state using a key', () => {
            let read: Read<number>;

            beforeEach(() => {
                read = readFrom(query, (state) => state.value);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial.value});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(read.value).toEqual(initial.value);
                });
            });
        });
    });

    describe('given a BehaviorSubject', () => {
        let behavior$: BehaviorSubject<string>;
        const initial = 'value';

        beforeEach(() => {
            behavior$ = new BehaviorSubject<string>(initial);
        });

        describe('when creating a new Read for the BehaviorSubject', () => {
            let read: Read<string>;

            beforeEach(() => {
                read = readFrom(behavior$);
            });

            it('should be created', () => {
                expect(read).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the initial value', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial});
                        expectObservable(from(read)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the initial value', () => {
                    expect(read.value).toEqual(initial);
                });
            });

            describe('and when emitting a new value', () => {
                const nextValue = 'next';

                beforeEach(() => {
                    behavior$.next(nextValue);
                });

                describe('and when subscribing', () => {
                    it('should observe the initial value', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: nextValue});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the initial value', () => {
                        expect(read.value).toEqual(nextValue);
                    });
                });
            });
        });
    });
});
