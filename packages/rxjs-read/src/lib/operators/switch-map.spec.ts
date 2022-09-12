import { BehaviorSubject, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Read } from '../read';
import { readFrom } from '../read-from';
import { readOf } from '../read-of';
import { filter } from './filter.operator';
import { switchMap } from './switch-map';

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('switchMap-operator', () => {
  describe('given a BehaviorSubject', () => {
    const initial = 'key';

    let subject: BehaviorSubject<string>;

    interface EntityData {
      id: string;
      value: string;
      count: number;
    }

    const switchedData: EntityData = {
      id: 'key',
      value: 'test',
      count: 10,
    };

    beforeEach(() => {
      subject = new BehaviorSubject(initial);
    });

    describe('and given a Read for the BehaviorSubject', () => {
      let read: Read<string>;

      beforeEach(() => {
        read = readFrom(subject);
      });

      describe('when piping with the switchMap operator', () => {
        let mappedRead: Read<EntityData | undefined>;

        beforeEach(() => {
          mappedRead = read.pipe(
            switchMap((key: string) => readOf(switchedData))
          );
        });

        describe('and when subscribing', () => {
          it('should observe mapped state', () => {
            testScheduler.run(({ expectObservable, cold }) => {
              const expected = cold('a', { a: switchedData });
              expectObservable(from(mappedRead)).toEqual(expected);
            });
          });
        });

        describe('and when synchronously accessing', () => {
          it('should return the mapped state', () => {
            expect(mappedRead.value).toEqual(switchedData);
          });
        });
      });
    });

    describe('and given a filtered Read for the BehaviorSubject', () => {
      let read: Read<string, true>;

      beforeEach(() => {
        read = readFrom(subject).pipe(filter((value: string) => false));
      });

      describe('when piping with the switchMap operator', () => {
        let mappedRead: Read<EntityData | undefined, true>;

        beforeEach(() => {
          mappedRead = read.pipe(
            switchMap((key: string) => readOf(switchedData))
          );
        });

        describe('and when subscribing', () => {
          it('should observe nothing', () => {
            testScheduler.run(({ expectObservable, cold }) => {
              const expected = cold<EntityData | undefined>('-------');
              expectObservable(from(mappedRead)).toEqual(expected);
            });
          });
        });

        describe('and when synchronously accessing', () => {
          it('should return undefined', () => {
            expect(mappedRead.value).not.toBeDefined();
          });
        });
      });
    });
  });
});
