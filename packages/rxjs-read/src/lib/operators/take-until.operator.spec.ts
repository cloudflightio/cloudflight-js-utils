import { BehaviorSubject, from, Subject } from 'rxjs';
import { Read } from '../read';
import { readFrom } from '../read-from';
import { takeUntil } from './take-until.operator';

describe('take-until-operator', () => {
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

    describe('when piping with the takeUntil operator', () => {
      let takeUntilRead: Read<number>;
      let destroy$: Subject<void>;

      beforeEach(() => {
        destroy$ = new Subject<void>();
        takeUntilRead = read.pipe(takeUntil<number>(destroy$));
      });

      describe('when subscribing', () => {
        describe('when destroy$ does not emit', () => {
          it('then work as if there was no takeUntil operator', () => {
            const emits = jest.fn();
            from(takeUntilRead).subscribe(emits);
            source$.next(1);
            source$.next(2);

            expect(emits).toHaveBeenCalledTimes(3);
            expect(emits).toHaveBeenNthCalledWith(1, 0);
            expect(emits).toHaveBeenNthCalledWith(2, 1);
            expect(emits).toHaveBeenNthCalledWith(3, 2);
          });
        });

        describe('when destroy$ emits', () => {
          it('then complete and stop emitting', () => {
            const emits = jest.fn();
            const completed = jest.fn();
            from(takeUntilRead).subscribe({
              next: emits,
              complete: completed,
            });
            source$.next(1);
            destroy$.next();
            source$.next(2);

            expect(emits).toHaveBeenCalledTimes(2);
            expect(emits).toHaveBeenNthCalledWith(1, 0);
            expect(emits).toHaveBeenNthCalledWith(2, 1);
            expect(completed).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('when synchronously accessing', () => {
        it('then work as if there was no takeUntil operator', () => {
          expect(takeUntilRead.value).toEqual(0);
          source$.next(1);
          expect(takeUntilRead.value).toEqual(1);
          destroy$.next();
          source$.next(2);
          expect(takeUntilRead.value).toEqual(2);
        });
      });
    });
  });
});
