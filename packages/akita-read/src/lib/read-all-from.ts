import { PipeFnNext, Read } from '@cloudflight/rxjs-read';
import {
  EntityState,
  getEntityType,
  HashMap,
  QueryEntity,
  SelectAllOptionsA,
  SelectAllOptionsB,
  SelectAllOptionsC,
  SelectAllOptionsD,
  SelectAllOptionsE,
  SelectOptions,
} from '@datorama/akita';
import { Observable } from 'rxjs';

export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options: SelectAllOptionsA<EntityType>
): Read<HashMap<EntityType>>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options: SelectAllOptionsB<EntityType>
): Read<EntityType[]>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options: SelectAllOptionsC<EntityType>
): Read<HashMap<EntityType>>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options: SelectAllOptionsD<EntityType>
): Read<EntityType[]>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options: SelectAllOptionsE<EntityType>
): Read<EntityType[]>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(queryEntity: QueryEntity<S>): Read<EntityType[]>;
export function readAllFrom<
  S extends EntityState,
  EntityType = getEntityType<S>
>(
  queryEntity: QueryEntity<S>,
  options?: SelectOptions<EntityType>
): Read<EntityType[] | HashMap<EntityType>> {
  if (options == null) {
    return new Read({
      observable(): Observable<EntityType[]> {
        return queryEntity.selectAll();
      },
      result(): PipeFnNext<EntityType[]> {
        return { type: 'next', value: queryEntity.getAll() };
      },
    });
  } else {
    return new Read({
      observable(): Observable<EntityType[] | HashMap<EntityType>> {
        return queryEntity.selectAll(options);
      },
      result(): PipeFnNext<EntityType[] | HashMap<EntityType>> {
        return { type: 'next', value: queryEntity.getAll(options) };
      },
    });
  }
}
