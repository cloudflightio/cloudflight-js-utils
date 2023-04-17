import {BehaviorSubject, from} from 'rxjs';
import {Read} from '../read';
import {readFrom} from '../read-from';
import {skip} from './skip.operator';

describe('skip-operator', () => {
    describe('given a Read', () => {
        let source$: BehaviorSubject<number>;
        let read: Read<number>;

        beforeEach(() => {
            source$ = new BehaviorSubject<number>(0);
            read = readFrom(source$);
        });

        afterEach(() => {
            source$.complete();
        });

        describe('when piping with the skip(1) operator', () => {
            let skippedRead: Read<number>;

            beforeEach(() => {
                skippedRead = read.pipe(skip<number>(1));
            });

            describe('and when subscribing', () => {
                it('then skip first value', () => {
                    const emits = jest.fn();
                    void from(skippedRead).subscribe(emits);
                    source$.next(1);
                    source$.next(2);

                    expect(emits).toHaveBeenCalledTimes(2);
                    expect(emits).toHaveBeenNthCalledWith(1, 1);
                    expect(emits).toHaveBeenNthCalledWith(2, 2);
                });
            });

            describe('and when synchronously accessing', () => {
                it('then return the current state', () => {
                    expect(skippedRead.value).toEqual(0);
                    source$.next(1);
                    expect(skippedRead.value).toEqual(1);
                });
            });
        });
    });
});
