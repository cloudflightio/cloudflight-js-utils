import {
    EntityState,
    EntityStore,
    Query,
    QueryEntity,
    Store,
} from '@datorama/akita';
import { selectFrom, Selection } from './select-from';
import { from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('select-from', () => {
    describe('given an Akita Query', () => {
        interface Data {
            value: string;
            count: number;
        }

        const initial: Data = {
            value: 'test',
            count: 10,
        };

        const store = new Store<Data>(initial, { name: 'store' });
        const query = new Query(store);

        describe('when creating a new selection for the whole state', () => {
            let selection: Selection<Data>;

            beforeEach(() => {
                selection = selectFrom(query);
            });

            it('should be created', () => {
                expect(selection).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({ expectObservable, cold }) => {
                        const expected = cold('a', { a: initial });
                        expectObservable(from(selection)).toEqual(expected);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(selection.sync).toEqual(initial);
                });
            });
        });
    });

    describe('given an Akita EntityQuery', () => {
        interface Data {
            id: string;
            value: string;
            count: number;
        }

        const initial: Data = {
            id: 'key',
            value: 'test',
            count: 10,
        };

        type DataEntity = EntityState<Data>;
        const store = new EntityStore<DataEntity>(undefined, { name: 'store' });
        const query = new QueryEntity(store);
        let expectedState: DataEntity;

        beforeEach(() => {
            store.set([initial]);
            expectedState = query.getValue();
        });

        describe('when creating a new selection for the whole state', () => {
            let selection: Selection<DataEntity>;

            beforeEach(() => {
                selection = selectFrom(query);
            });

            it('should be created', () => {
                expect(selection).toBeDefined();
            });

            describe('and when subscribing', () => {
                it('should observe the whole state', () => {
                    testScheduler.run(({ expectObservable, cold }) => {
                        const expected = cold('a', { a: expectedState });
                        expectObservable(from(selection)).toEqual(expected);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the whole state', () => {
                    expect(selection.sync).toEqual(expectedState);
                });
            });
        });
    });
});
