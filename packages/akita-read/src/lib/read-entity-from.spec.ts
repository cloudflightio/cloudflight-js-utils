import {Read} from '@cloudflight/rxjs-read';
import {EntityState, EntityStore, QueryEntity} from '@datorama/akita';
import {from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {readEntityFrom} from './read-entity-from';
import {beforeEach, describe, expect, it, vi, MockedFunction} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('readEntityFrom', () => {
    describe('given an Akita QueryEntity', () => {
        interface EntityData {
            id: string;
            value: string;
            count: number;
        }

        type State = EntityState<EntityData>;

        const initialEntity: EntityData = {
            id: 'key',
            value: 'test',
            count: 10,
        };
        const store = new EntityStore<State>(undefined, {name: 'store'});
        const query = new QueryEntity(store);

        describe('and given there is no entity in the store', () => {
            beforeEach(() => {
                store.set([]);
            });

            describe('when creating a new Read for the a entity using its id', () => {
                let read: Read<EntityData | undefined>;

                beforeEach(() => {
                    read = readEntityFrom(query, initialEntity.id);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe undefined', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: undefined});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return undefined', () => {
                        expect(read.value).not.toBeDefined();
                    });
                });
            });

            describe('when creating a new Read for the a entity using its id and a key', () => {
                let read: Read<number | undefined>;

                beforeEach(() => {
                    read = readEntityFrom(query, initialEntity.id, 'count');
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe undefined', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: undefined});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return undefined', () => {
                        expect(read.value).not.toBeDefined();
                    });
                });
            });

            describe('when creating a new Read for the a entity using its id and a projection', () => {
                let read: Read<number | undefined>;
                let projection: MockedFunction<(entity?: EntityData) => number>;

                beforeEach(() => {
                    projection = vi.fn().mockImplementation((entity?: EntityData) => entity?.count);

                    read = readEntityFrom(query, initialEntity.id, projection);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe undefined and the projection is never called', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: undefined});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                        expect(projection).not.toBeCalled();
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return undefined and the projection is never called', () => {
                        expect(read.value).not.toBeDefined();
                        expect(projection).not.toBeCalled();
                    });
                });
            });
        });

        describe('and given there is an entity in the store', () => {
            beforeEach(() => {
                store.set([initialEntity]);
            });

            describe('when creating a new Read for the a entity using its id', () => {
                let read: Read<EntityData | undefined>;

                beforeEach(() => {
                    read = readEntityFrom(query, initialEntity.id);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe the entity', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: initialEntity});
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the entity', () => {
                        expect(read.value).toEqual(initialEntity);
                    });
                });
            });

            describe('when creating a new Read for the a entity using its id and a key', () => {
                let read: Read<number | undefined>;

                beforeEach(() => {
                    read = readEntityFrom(query, initialEntity.id, 'count');
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe the count field of the entity', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {
                                a: initialEntity.count,
                            });
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the count field of the entity', () => {
                        expect(read.value).toEqual(initialEntity.count);
                    });
                });
            });

            describe('when creating a new Read for the a entity using its id and a projection', () => {
                let read: Read<number | undefined>;

                beforeEach(() => {
                    read = readEntityFrom(query, initialEntity.id, (entity?: EntityData) => entity?.count);
                });

                it('should be created', () => {
                    expect(read).toBeDefined();
                });

                describe('and when subscribing', () => {
                    it('should observe the projection of the entity', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {
                                a: initialEntity.count,
                            });
                            expectObservable(from(read)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the projection of the entity', () => {
                        expect(read.value).toEqual(initialEntity.count);
                    });
                });
            });
        });
    });
});
