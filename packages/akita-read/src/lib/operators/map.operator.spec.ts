import { Query, Store } from '@datorama/akita';
import { from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Read } from '../read';
import { readFrom } from '../read-from';
import { map } from './map.operator';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('map-operator', () => {
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

    describe('given a Read', () => {
        let read: Read<Data>;

        beforeEach(() => {
            read = readFrom(query);
        });

        describe('when piping with the map operator', () => {
            let mappedRead: Read<number>;

            beforeEach(() => {
                mappedRead = read.pipe(map((data: Data) => data.count));
            });

            describe('and when subscribing', () => {
                it('should observe mapped state', () => {
                    testScheduler.run(({ expectObservable, cold }) => {
                        const expected = cold('a', { a: initial.count });
                        expectObservable(from(mappedRead)).toEqual(expected);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the mapped state', () => {
                    expect(mappedRead.value).toEqual(initial.count);
                });
            });

            describe('and when piping with the map operator again', () => {
                let finalRead: Read<string>;

                beforeEach(() => {
                    finalRead = mappedRead.pipe(
                        map((value: number) => `${value}`)
                    );
                });

                describe('and when subscribing', () => {
                    it('should observe mapped state', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: `${initial.count}`,
                            });
                            expectObservable(from(finalRead)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the mapped state', () => {
                        expect(finalRead.value).toEqual(`${initial.count}`);
                    });
                });
            });
        });
    });
});
