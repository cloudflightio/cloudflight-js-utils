import {Read} from '@cloudflight/rxjs-read';
import {EntityState, EntityStore, QueryEntity} from '@datorama/akita';
import {from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {readManyFrom} from './read-many-from';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('readManyFrom', () => {
    describe('given an Akita QueryEntity', () => {
        interface EntityData {
            id: string;
            value: string;
            count: number;
        }

        type State = EntityState<EntityData>;

        const initialEntity1: EntityData = {
            id: 'key1',
            value: 'test',
            count: 10,
        };
        const initialEntity2: EntityData = {
            id: 'key2',
            value: 'test',
            count: 10,
        };
        const initialEntity3: EntityData = {
            id: 'key3',
            value: 'test',
            count: 10,
        };
        const store = new EntityStore<State>(undefined, {name: 'store'});
        const query = new QueryEntity(store);

        describe('and given there is no entity in the store', () => {
            beforeEach(() => {
                store.set([]);
            });

            describe('when creating a new Read for the a entity using multiple ids', () => {
                let read: Read<EntityData[]>;

                beforeEach(() => {
                    read = readManyFrom(query, [initialEntity1.id, initialEntity2.id]);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: []});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual([]);
                    });
                });
            });

            describe('when creating a new Read for the a entity using multiple ids and a projection', () => {
                let read: Read<number[]>;

                beforeEach(() => {
                    read = readManyFrom(query, [initialEntity1.id, initialEntity2.id], (entity) => entity.count);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe an empty array', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: []});
                            expectObservable(from(read)).toEqual(expected$);
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

        describe('and given there are entities in the store', () => {
            beforeEach(() => {
                store.set([initialEntity1, initialEntity2, initialEntity3]);
            });

            describe('when creating a new Read for the a entity using multiple ids', () => {
                let read: Read<EntityData[]>;
                const expectedArray = [initialEntity1, initialEntity2];

                beforeEach(() => {
                    read = readManyFrom(query, [initialEntity1.id, initialEntity2.id]);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe the entities', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: expectedArray});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual(expectedArray);
                    });
                });
            });

            describe('when creating a new Read for the a entity using multiple ids and a projection', () => {
                let read: Read<number[]>;
                const expectedArray = [initialEntity1.count, initialEntity2.count];

                beforeEach(() => {
                    read = readManyFrom(query, [initialEntity1.id, initialEntity2.id], (entity) => entity.count);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe the entities', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: expectedArray});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return an empty array', () => {
                        expect(read.value).toEqual(expectedArray);
                    });
                });
            });
        });
    });
});
