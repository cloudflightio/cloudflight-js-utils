import {BehaviorSubject, from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {Read} from '../read';
import {readFrom} from '../read-from';
import {filter} from './filter.operator';
import {map} from './map.operator';
import {beforeEach, describe, expect, it, vi, MockedFunction} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('filter-operator', () => {
    interface Data {
        value: string;
        count: number;
    }

    const initial: Data = {
        value: 'test',
        count: 10,
    };

    const query$ = new BehaviorSubject(initial);

    describe('given a Read', () => {
        let read: Read<Data>;

        beforeEach(() => {
            read = readFrom(query$);
        });

        describe('when piping with the filter operator and permitting the value', () => {
            let mappedRead: Read<Data, true>;

            beforeEach(() => {
                mappedRead = read.pipe(filter((data: Data) => true));
            });

            describe('and when subscribing', () => {
                it('should observe state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: initial});
                        expectObservable(from(mappedRead)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the state', () => {
                    expect(mappedRead.value).toEqual(initial);
                });
            });

            describe('and when piping with the map operator afterwards', () => {
                let finalRead: Read<string, true>;

                beforeEach(() => {
                    finalRead = mappedRead.pipe(map((data: Data) => String(data.count)));
                });

                describe('and when subscribing', () => {
                    it('should observe the mapped state', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {
                                a: String(initial.count),
                            });
                            expectObservable(from(finalRead)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the mapped state', () => {
                        expect(finalRead.value).toEqual(String(initial.count));
                    });
                });
            });
        });

        describe('when piping with the filter operator and filtering the value', () => {
            let mappedRead: Read<Data, true>;

            beforeEach(() => {
                mappedRead = read.pipe(filter((data: Data) => false));
            });

            describe('and when subscribing', () => {
                it('should not observe anything', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold<Data>('-------');
                        expectObservable(from(mappedRead)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return undefined', () => {
                    expect(mappedRead.value).not.toBeDefined();
                });
            });

            describe('and when piping with the map operator afterwards', () => {
                let finalRead: Read<string, true>;
                let mapFn: MockedFunction<(data: Data) => string>;

                beforeEach(() => {
                    vi.resetAllMocks();
                    mapFn = vi.fn().mockReturnValue('oh no!!!');
                    finalRead = mappedRead.pipe(map(mapFn));
                });

                describe('and when subscribing', () => {
                    it('should not call the map function after the filter', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('-------');
                            expectObservable(from(finalRead)).toEqual(expected$);
                        });
                        expect(mapFn).not.toBeCalled();
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should not call the map function after the filter', () => {
                        expect(finalRead.value).not.toBeDefined();
                        expect(mapFn).not.toBeCalled();
                    });
                });
            });
        });

        describe('when piping with the filter operator and filtering the value and mapping the value afterwards', () => {
            let mappedRead: Read<number, true>;
            let mapFn: MockedFunction<(data: Data) => number>;

            beforeEach(() => {
                vi.resetAllMocks();
                mapFn = vi.fn().mockReturnValue(2);

                mappedRead = read.pipe(
                    filter((data: Data) => false),
                    map(mapFn),
                );
            });

            describe('and when subscribing', () => {
                it('should not call the map function after the filter', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold<number>('-------');
                        expectObservable(from(mappedRead)).toEqual(expected$);
                    });
                    expect(mapFn).not.toBeCalled();
                });
            });

            describe('and when synchronously accessing', () => {
                it('should not call the map function after the filter', () => {
                    expect(mappedRead.value).not.toBeDefined();
                    expect(mapFn).not.toBeCalled();
                });
            });
        });
    });
});
