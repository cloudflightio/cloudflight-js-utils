import {
    EntityState,
    EntityStore,
    HashMap,
    Order,
    QueryEntity,
    SelectAllOptionsA,
    SelectAllOptionsB,
    SelectAllOptionsC,
    SelectAllOptionsD,
    SelectAllOptionsE,
} from '@datorama/akita';
import { Read } from './read';
import { from } from 'rxjs';
import { readAllFrom } from './read-all-from';
import { TestScheduler } from 'rxjs/testing';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('readAllFrom', () => {
    describe('given an Akita QueryEntity', () => {
        interface EntityData {
            id: string;
            value: string;
            count: number;
        }

        type State = EntityState<EntityData>;

        const initialEntity1: EntityData = {
            id: 'key1',
            value: 'test1',
            count: 10,
        };
        const initialEntity2: EntityData = {
            id: 'key2',
            value: 'test2',
            count: 11,
        };
        let store: EntityStore<State>;
        let query: QueryEntity<State>;

        beforeEach(() => {
            store = new EntityStore<State>(undefined, { name: 'store' });
            query = new QueryEntity(store);
        });

        describe('and given there is no entity in the store', () => {
            beforeEach(() => {
                store.set([]);
            });

            describe('when creating a new Read for all entities', () => {
                let read: Read<EntityData[]>;

                beforeEach(() => {
                    read = readAllFrom(query);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', { a: [] });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual([]);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsA', () => {
                let read: Read<HashMap<EntityData>>;
                const options: SelectAllOptionsA<EntityData> = {
                    asObject: true,
                    filterBy: (entity) => entity.count === 10,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty object', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: {},
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty object', () => {
                        expect(read.value).toEqual({});
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsB', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsB<EntityData> = {
                    filterBy: (entity) => entity.count === 10,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: [],
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual([]);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsC', () => {
                let read: Read<HashMap<EntityData>>;
                const options: SelectAllOptionsC<EntityData> = {
                    asObject: true,
                    limitTo: 1,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty object', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: {},
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty object', () => {
                        expect(read.value).toEqual({});
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsD', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsD<EntityData> = {
                    sortBy: 'count',
                    sortByOrder: Order.DESC,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: [],
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual([]);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsE', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsE<EntityData> = {
                    asObject: false,
                    sortBy: 'count',
                    sortByOrder: Order.DESC,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: [],
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual([]);
                    });
                });
            });
        });

        describe('and given there is an entity in the store', () => {
            beforeEach(() => {
                store.set([initialEntity1, initialEntity2]);
            });

            describe('when creating a new Read for all entities', () => {
                let read: Read<EntityData[]>;

                beforeEach(() => {
                    read = readAllFrom(query);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe all entities', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: [initialEntity1, initialEntity2],
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return all entities', () => {
                        expect(read.value).toEqual([
                            initialEntity1,
                            initialEntity2,
                        ]);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsA', () => {
                let read: Read<HashMap<EntityData>>;
                const options: SelectAllOptionsA<EntityData> = {
                    asObject: true,
                    filterBy: (entity) => entity.count === 10,
                };
                const expectedMap = { [initialEntity1.id]: initialEntity1 };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an object that contains initialEntity1', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: expectedMap,
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an object that contains initialEntity1', () => {
                        expect(read.value).toEqual(expectedMap);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsB', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsB<EntityData> = {
                    filterBy: (entity) => entity.count === 10,
                };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an array with initialEntity1', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: [initialEntity1],
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an array with initialEntity1', () => {
                        expect(read.value).toEqual([initialEntity1]);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsC', () => {
                let read: Read<HashMap<EntityData>>;
                const options: SelectAllOptionsC<EntityData> = {
                    asObject: true,
                    limitTo: 1,
                };
                const expectedMap = { [initialEntity1.id]: initialEntity1 };

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an object with initialEntity1', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: expectedMap,
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an object with initialEntity1', () => {
                        expect(read.value).toEqual(expectedMap);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsD', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsD<EntityData> = {
                    sortBy: 'count',
                    sortByOrder: Order.DESC,
                };
                const expectedArray = [initialEntity2, initialEntity1];

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an ordered array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: expectedArray,
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an ordered array', () => {
                        expect(read.value).toEqual(expectedArray);
                    });
                });
            });

            describe('when creating a new Read for all entities with Akita SelectAllOptionsE', () => {
                let read: Read<EntityData[]>;
                const options: SelectAllOptionsE<EntityData> = {
                    asObject: false,
                    sortBy: 'count',
                    sortByOrder: Order.DESC,
                };
                const expectedArray = [initialEntity2, initialEntity1];

                beforeEach(() => {
                    read = readAllFrom(query, options);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an ordered array', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: expectedArray,
                            });
                            expectObservable(from(read)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an ordered array', () => {
                        expect(read.value).toEqual(expectedArray);
                    });
                });
            });
        });
    });
});
