import {map} from './map.operator';
import {TestScheduler} from 'rxjs/testing';
import {Read} from '../read';
import {BehaviorSubject, from} from 'rxjs';
import {shareReplay} from './share-replay.operator';
import {readFrom} from '../read-from';
import {beforeEach, describe, expect, it, MockedFunction, vi} from 'vitest';

const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
});

describe('shareReplay-operator', () => {
    let behavior$: BehaviorSubject<string>;

    beforeEach(() => {
        behavior$ = new BehaviorSubject<string>('initial');
    });

    describe('given a mapped Read', () => {
        let read: Read<number>;
        const mapFn: MockedFunction<(v: string) => number> = vi.fn();

        beforeEach(() => {
            vi.resetAllMocks();

            mapFn.mockImplementation((v: string) => v.length);

            read = readFrom(behavior$).pipe(map(mapFn));
        });

        describe('when pipping with the shareReplay operator', () => {
            let pipped: Read<number>;

            beforeEach(() => {
                pipped = read.pipe(shareReplay<number>({bufferSize: 1, refCount: true}));
            });

            it('when subscribing twice to the read should call mapFn only once', () => {
                testScheduler.run(({expectObservable, cold}) => {
                    const expected$ = cold('a', {a: 7});
                    expectObservable(from(pipped)).toEqual(expected$);
                    expectObservable(from(pipped)).toEqual(expected$);
                });
                expect(mapFn).toBeCalledTimes(1);
            });

            it('when getting the value sync it should not have any effect', () => {
                expect(pipped.value).toEqual(7);
            });
        });
    });
});
