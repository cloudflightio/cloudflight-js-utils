import {from} from 'rxjs';
import {TestScheduler} from 'rxjs/testing';
import {Read} from '../read';
import {ContinuingReadProvider} from '../read-providers';
import {distinctUntilChanged} from './distinct-until-changed.operator';
import {beforeEach, describe, expect, it, Mocked, vi} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('distinctUntilChanged-operator', () => {
    const dummyProvider: Mocked<ContinuingReadProvider<string>> = {
        observable: vi.fn(),
        result: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();
        dummyProvider.observable.mockReturnValue(testScheduler.createColdObservable('aabb', {a: 'a', b: 'b'}));
    });

    describe('given a Read', () => {
        let read: Read<string>;

        beforeEach(() => {
            read = new Read<string>(dummyProvider);
        });

        describe('when pipping using distinctUntilChanged', () => {
            let pipped: Read<string>;

            beforeEach(() => {
                pipped = read.pipe(distinctUntilChanged<string>());
            });

            it('should only emit when the value changes', () => {
                testScheduler.run(({expectObservable, cold}) => {
                    expectObservable(from(pipped)).toEqual(cold('a-b-', {a: 'a', b: 'b'}));
                });
            });

            it('should not have any effect on a sync read', () => {
                dummyProvider.result.mockReturnValue({
                    type: 'next',
                    value: 'a',
                });

                expect(pipped.value).toEqual('a');
            });
        });

        describe('when pipping using distinctUntilChanged with a comparator function', () => {
            let pipped: Read<string>;

            beforeEach(() => {
                let called = 0;

                pipped = read.pipe(distinctUntilChanged<string>(() => ++called % 2 === 0));
            });

            it('should only emit when the comparator returns false and the first value', () => {
                testScheduler.run(({expectObservable, cold}) => {
                    expectObservable(from(pipped)).toEqual(cold('aa-b', {a: 'a', b: 'b'}));
                });
            });

            it('should not have any effect on a sync read', () => {
                dummyProvider.result.mockReturnValue({
                    type: 'next',
                    value: 'a',
                });

                expect(pipped.value).toEqual('a');
            });
        });
    });
});
