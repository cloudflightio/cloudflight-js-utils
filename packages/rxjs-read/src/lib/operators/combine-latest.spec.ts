import {BehaviorSubject, from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {combineLatest} from './combine-latest';
import {filter} from './filter.operator';
import {Read} from '../read';
import {readFrom} from '../read-from';
import {ContinuingReadProvider} from '../read-providers';
import {beforeEach, describe, expect, it, Mocked, vi} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('combineLatest', () => {
    const initial1 = 'test';
    const initial2 = 10;

    let subject1$: BehaviorSubject<string>;
    let subject2$: BehaviorSubject<number>;

    beforeEach(() => {
        subject1$ = new BehaviorSubject(initial1);
        subject2$ = new BehaviorSubject(initial2);
    });

    describe('given multiple reads', () => {
        let read1: Read<string>;
        let read2: Read<number>;

        beforeEach(() => {
            read1 = readFrom(subject1$);
            read2 = readFrom(subject2$);
        });

        describe('when combining them with combineLatest', () => {
            const expectedRead: [string, number] = [initial1, initial2];
            let combined: Read<[string, number]>;

            beforeEach(() => {
                combined = combineLatest([read1, read2]);
            });

            describe('and when subscribing', () => {
                it('should observe the combined state', () => {
                    testScheduler.run(({expectObservable, cold}) => {
                        const expected$ = cold('a', {a: expectedRead});
                        expectObservable(from(combined)).toEqual(expected$);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the combined state', () => {
                    expect(combined.value).toEqual(expectedRead);
                });
            });
        });
    });

    describe('given multiple filtered reads', () => {
        let read1: Read<string, true>;
        let read2: Read<number>;

        beforeEach(() => {
            read1 = readFrom(subject1$).pipe(filter((value: string) => value === initial1));
            read2 = readFrom(subject2$);
        });

        describe('and given nothing gets filtered', () => {
            describe('when combining them with combineLatest', () => {
                const expectedRead: [string, number] = [initial1, initial2];
                let combined: Read<[string, number], true>;

                beforeEach(() => {
                    combined = combineLatest([read1, read2]);
                });

                describe('and when subscribing', () => {
                    it('should observe the combined state', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('a', {a: expectedRead});
                            expectObservable(from(combined)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the combined state', () => {
                        expect(combined.value).toEqual(expectedRead);
                    });
                });
            });
        });

        describe('and given at least one gets filtered', () => {
            describe('from the beginning', () => {
                beforeEach(() => {
                    subject1$.next('filtered');
                });

                describe('when combining them with combineLatest', () => {
                    let combined: Read<[string, number], true>;

                    beforeEach(() => {
                        combined = combineLatest([read1, read2]);
                    });

                    describe('and when subscribing', () => {
                        it('should observe nothing', () => {
                            testScheduler.run(({expectObservable, cold}) => {
                                const expected$ = cold<[string, number]>('-------');
                                expectObservable(from(combined)).toEqual(expected$);
                            });
                        });
                    });

                    describe('and when synchronously accessing', () => {
                        it('should return undefined', () => {
                            expect(combined.value).not.toBeDefined();
                        });
                    });
                });
            });

            describe('after the first emit when combining them with combineLatest', () => {
                const mockedProvider1: Mocked<ContinuingReadProvider<string>> = {
                    observable: vi.fn(),
                    result: vi.fn(),
                };
                const mockedProvider2: Mocked<ContinuingReadProvider<number>> = {
                    observable: vi.fn(),
                    result: vi.fn(),
                };

                const expectedRead: [string, number] = [initial1, initial2];
                let combined: Read<[string, number], true>;

                beforeEach(() => {
                    vi.resetAllMocks();
                    mockedProvider1.observable.mockReturnValue(
                        testScheduler.createColdObservable('ab', {
                            a: initial1,
                            b: 'filtered',
                        }),
                    );
                    mockedProvider1.result
                        .mockReturnValueOnce({
                            type: 'next',
                            value: initial1,
                        })
                        .mockReturnValueOnce({
                            type: 'next',
                            value: 'filtered',
                        });
                    mockedProvider2.observable.mockReturnValue(
                        testScheduler.createColdObservable('aa', {
                            a: initial2,
                        }),
                    );
                    mockedProvider2.result
                        .mockReturnValueOnce({
                            type: 'next',
                            value: initial2,
                        })
                        .mockReturnValueOnce({
                            type: 'next',
                            value: initial2,
                        });

                    read1 = new Read<string>(mockedProvider1).pipe(filter((value: string) => value === initial1));
                    read2 = new Read<number>(mockedProvider2);

                    combined = combineLatest([read1, read2]);
                });

                describe('and when subscribing', () => {
                    it('should observe the old value after the change', () => {
                        testScheduler.run(({expectObservable, cold}) => {
                            const expected$ = cold('aa', {a: expectedRead});
                            expectObservable(from(combined)).toEqual(expected$);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return undefined after the change', () => {
                        expect(combined.value).toBeDefined();
                        expect(combined.value).not.toBeDefined();
                    });
                });
            });
        });
    });
});
