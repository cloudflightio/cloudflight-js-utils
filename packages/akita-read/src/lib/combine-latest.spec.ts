import { Query, Store } from '@datorama/akita';
import { from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { combineLatest } from './combine-latest';
import { filter } from './operators/filter.operator';
import { Read } from './read';
import { readFrom } from './read-from';
import { ContinuingReadProvider } from './read-providers';
import Mocked = jest.Mocked;

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('combineLatest', () => {
  interface Data {
    value: string;
    count: number;
    unused: string;
  }

  const initial: Data = {
    value: 'test',
    count: 10,
    unused: 'unused',
  };

  let store: Store<Data>;
  let query: Query<Data>;

  beforeEach(() => {
    store = new Store<Data>(initial, { name: 'store' });
    query = new Query(store);
  });

  describe('given multiple reads', () => {
    let read1: Read<string>;
    let read2: Read<number>;

    beforeEach(() => {
      read1 = readFrom(query, 'value');
      read2 = readFrom(query, 'count');
    });

    describe('when combining them with combineLatest', () => {
      const expectedRead: [string, number] = [initial.value, initial.count];
      let combined: Read<[string, number]>;

      beforeEach(() => {
        combined = combineLatest([read1, read2]);
      });

      describe('and when subscribing', () => {
        it('should observe the combined state', () => {
          testScheduler.run(({ expectObservable, cold }) => {
            const expected = cold('a', { a: expectedRead });
            expectObservable(from(combined)).toEqual(expected);
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
      read1 = readFrom(query, 'value').pipe(
        filter((value: string) => value === initial.value)
      );
      read2 = readFrom(query, 'count');
    });

    describe('and given nothing gets filtered', () => {
      describe('when combining them with combineLatest', () => {
        const expectedRead: [string, number] = [initial.value, initial.count];
        let combined: Read<[string, number], true>;

        beforeEach(() => {
          combined = combineLatest([read1, read2]);
        });

        describe('and when subscribing', () => {
          it('should observe the combined state', () => {
            testScheduler.run(({ expectObservable, cold }) => {
              const expected = cold('a', { a: expectedRead });
              expectObservable(from(combined)).toEqual(expected);
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
          store.update({ value: 'filtered' });
        });

        describe('when combining them with combineLatest', () => {
          let combined: Read<[string, number], true>;

          beforeEach(() => {
            combined = combineLatest([read1, read2]);
          });

          describe('and when subscribing', () => {
            it('should observe nothing', () => {
              testScheduler.run(({ expectObservable, cold }) => {
                const expected = cold<[string, number]>('-------');
                expectObservable(from(combined)).toEqual(expected);
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
          observable: jest.fn(),
          result: jest.fn(),
        };
        const mockedProvider2: Mocked<ContinuingReadProvider<number>> = {
          observable: jest.fn(),
          result: jest.fn(),
        };

        const expectedRead: [string, number] = [initial.value, initial.count];
        let combined: Read<[string, number], true>;

        beforeEach(() => {
          jest.resetAllMocks();
          mockedProvider1.observable.mockReturnValue(
            testScheduler.createColdObservable('ab', {
              a: initial.value,
              b: 'filtered',
            })
          );
          mockedProvider1.result
            .mockReturnValueOnce({
              type: 'next',
              value: initial.value,
            })
            .mockReturnValueOnce({
              type: 'next',
              value: 'filtered',
            });
          mockedProvider2.observable.mockReturnValue(
            testScheduler.createColdObservable('aa', {
              a: initial.count,
            })
          );
          mockedProvider2.result
            .mockReturnValueOnce({
              type: 'next',
              value: initial.count,
            })
            .mockReturnValueOnce({
              type: 'next',
              value: initial.count,
            });

          read1 = new Read<string>(mockedProvider1).pipe(
            filter((value: string) => value === initial.value)
          );
          read2 = new Read<number>(mockedProvider2);

          combined = combineLatest([read1, read2]);
        });

        describe('and when subscribing', () => {
          it('should observe the old value after the change', () => {
            testScheduler.run(({ expectObservable, cold }) => {
              const expected = cold('aa', { a: expectedRead });
              expectObservable(from(combined)).toEqual(expected);
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
