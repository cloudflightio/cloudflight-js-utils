import { BehaviorSubject, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Read } from '../read';
import { readFrom } from '../read-from';
import { filter } from './filter.operator';
import { withLatestFrom } from './with-latest-from.operator';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('withLatestFrom-operator', () => {
    describe('given 2 Reads', () => {
        let behavior1: BehaviorSubject<string>;
        const initial1 = 'initial';
        let behavior2: BehaviorSubject<number>;
        const initial2 = 0;

        let read1: Read<string>;
        let read2: Read<number>;

        beforeEach(() => {
            behavior1 = new BehaviorSubject<string>(initial1);
            behavior2 = new BehaviorSubject<number>(initial2);

            read1 = readFrom(behavior1);
            read2 = readFrom(behavior2);
        });

        describe('when pipping using the withLatestFrom operator', () => {
            type PippedValue = [string, number];
            let pipped: Read<PippedValue>;
            const expectedValue: PippedValue = [initial1, initial2];

            beforeEach(() => {
                pipped = read1.pipe(
                    withLatestFrom<string, typeof read2>(read2)
                );
            });

            describe('and when subscribing', () => {
                it('should observe mapped state', () => {
                    testScheduler.run(({ expectObservable, cold }) => {
                        const expected = cold('a', { a: expectedValue });
                        expectObservable(from(pipped)).toEqual(expected);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the mapped state', () => {
                    expect(pipped.value).toEqual(expectedValue);
                });
            });

            describe('and when behavior2 emits a new value', () => {
                const nextValue = 10;
                const nextExpectedValue: PippedValue = [initial1, nextValue];

                beforeEach(() => {
                    behavior2.next(nextValue);
                });

                describe('and when subscribing', () => {
                    it('should observe mapped state', () => {
                        testScheduler.run(({ expectObservable, cold }) => {
                            const expected = cold('a', {
                                a: nextExpectedValue,
                            });
                            expectObservable(from(pipped)).toEqual(expected);
                        });
                    });
                });

                describe('and when synchronously accessing', () => {
                    it('should return the mapped state', () => {
                        expect(pipped.value).toEqual(nextExpectedValue);
                    });
                });
            });
        });

        describe('when pipping using the withLatestFrom operator with a filtered read', () => {
            let filteredRead: Read<number, true>;

            type PippedValue = [string, number];
            let pipped: Read<PippedValue, true>;

            beforeEach(() => {
                filteredRead = read2.pipe(filter((value: number) => false));
                pipped = read1.pipe(
                    withLatestFrom<string, typeof filteredRead>(filteredRead)
                );
            });

            describe('and when subscribing', () => {
                it('should observe mapped state', () => {
                    testScheduler.run(({ expectObservable, cold }) => {
                        const expected = cold<PippedValue>('----');
                        expectObservable(from(pipped)).toEqual(expected);
                    });
                });
            });

            describe('and when synchronously accessing', () => {
                it('should return the mapped state', () => {
                    expect(pipped.value).not.toBeDefined();
                });
            });
        });
    });
});
