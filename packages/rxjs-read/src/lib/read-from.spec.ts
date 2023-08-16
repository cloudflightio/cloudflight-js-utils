import {BehaviorSubject, from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {Read} from './read';
import {readFrom} from './read-from';
import {beforeEach, describe, expect, it} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('select-from', () => {
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
