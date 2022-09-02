import {
  EntityState,
  EntityStore,
  Query,
  QueryEntity,
  Store,
} from '@datorama/akita';
import { from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { Read } from '../read';
import { readEntityFrom } from '../read-entity-from';
import { readFrom } from '../read-from';
import { filter } from './filter.operator';
import { switchMap } from './switch-map';

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe('switchMap-operator', () => {
  describe('given an Akita Query and an Akita QueryEntity', () => {
    interface Data {
      value: string;
      count: number;
    }

    const initial: Data = {
      value: 'key',
      count: 10,
    };

    let store: Store<Data>;
    let query: Query<Data>;

    interface EntityData {
      id: string;
      value: string;
      count: number;
    }

    type State = EntityState<EntityData>;

    const initialEntity: EntityData = {
      id: 'key',
      value: 'test',
      count: 10,
    };
    let entityStore: EntityStore<State>;
    let queryEntity: QueryEntity<State>;

    beforeEach(() => {
      store = new Store<Data>(initial, { name: 'store' });
      query = new Query(store);
      entityStore = new EntityStore<State>(undefined, { name: 'store' });
      queryEntity = new QueryEntity(entityStore);
      entityStore.set([initialEntity]);
    });

    describe('and given a "normal" Read for the Akita Query', () => {
      let read: Read<string>;

      beforeEach(() => {
        read = readFrom(query, 'value');
      });

      describe('when piping with the switchMap operator', () => {
        let mappedRead: Read<EntityData | undefined>;

        beforeEach(() => {
          mappedRead = read.pipe(
            switchMap((key: string) => readEntityFrom(queryEntity, key))
          );
        });

        describe('and when subscribing', () => {
          it('should observe mapped state', () => {
            testScheduler.run(({ expectObservable, cold }) => {
              const expected = cold('a', { a: initialEntity });
              expectObservable(from(mappedRead)).toEqual(expected);
            });
          });
        });

        describe('and when synchronously accessing', () => {
          it('should return the mapped state', () => {
            expect(mappedRead.value).toEqual(initialEntity);
          });
        });
      });
    });

    describe('and given a filtered Read for the Akita Query', () => {
      let read: Read<string, true>;

      beforeEach(() => {
        read = readFrom(query, 'value').pipe(filter((value: string) => false));
      });

      describe('when piping with the switchMap operator', () => {
        let mappedRead: Read<EntityData | undefined, true>;

        beforeEach(() => {
          mappedRead = read.pipe(
            switchMap((key: string) => readEntityFrom(queryEntity, key))
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
