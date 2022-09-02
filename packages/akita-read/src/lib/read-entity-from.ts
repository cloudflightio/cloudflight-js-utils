import { PipeFnNext, Read } from '@cloudflight/rxjs-read';
import {
  EntityState,
  getEntityType,
  getIDType,
  QueryEntity,
} from '@datorama/akita';
import { Observable } from 'rxjs';

type EntityProjection<EntityType, R = unknown> = (entity?: EntityType) => R;

export function readEntityFrom<
  S extends EntityState,
  EntityType = getEntityType<S>,
  IDType = getIDType<S>
>(
  queryEntity: QueryEntity<S, EntityType, IDType>,
  id: IDType
): Read<EntityType | undefined>;
export function readEntityFrom<
  S extends EntityState,
  K extends keyof EntityType,
  EntityType = getEntityType<S>,
  IDType = getIDType<S>
>(
  queryEntity: QueryEntity<S, EntityType, IDType>,
  id: IDType,
  key: K
): Read<EntityType[K] | undefined>;
export function readEntityFrom<
  S extends EntityState,
  R,
  EntityType = getEntityType<S>,
  IDType = getIDType<S>
>(
  queryEntity: QueryEntity<S, EntityType, IDType>,
  id: IDType,
  project: (entity?: EntityType) => R
): Read<R | undefined>;
export function readEntityFrom<
  S extends EntityState,
  K extends keyof EntityType,
  R = unknown,
  EntityType = getEntityType<S>,
  IDType = getIDType<S>
>(
  queryEntity: QueryEntity<S, EntityType, IDType>,
  id: IDType,
  keyOrProject?: K | EntityProjection<EntityType, R>
): Read<unknown> {
  if (keyOrProject == null) {
    return new Read({
      observable(): Observable<EntityType | undefined> {
        return queryEntity.selectEntity(id);
      },
      result(): PipeFnNext<EntityType | undefined> {
        return {
          type: 'next',
          value: queryEntity.getEntity(id),
        };
      },
    });
  } else if (typeof keyOrProject === 'function') {
    return new Read({
      observable(): Observable<R | undefined> {
        return queryEntity.selectEntity(id, keyOrProject);
      },
      result(): PipeFnNext<R | undefined> {
        return {
          type: 'next',
          value: keyOrProject(queryEntity.getEntity(id)),
        };
      },
    });
  } else {
    return new Read({
      observable(): Observable<EntityType[K] | undefined> {
        return queryEntity.selectEntity(id, keyOrProject);
      },
      result(): PipeFnNext<EntityType[K] | undefined> {
        return {
          type: 'next',
          value: queryEntity.getEntity(id)?.[keyOrProject],
        };
      },
    });
  }
}
