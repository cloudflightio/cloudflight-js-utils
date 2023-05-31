import {PipeFnNext, Read} from '@cloudflight/rxjs-read';
import {EntityState, getEntityType, getIDType, QueryEntity} from '@datorama/akita';
import {Observable} from 'rxjs';
import {isDefined} from './util/is-defined';

/**
 * Create a new {@link Read} by selecting multiple entities from a {@link @datorama/akita!QueryEntity | QueryEntity} using an array of ids:
 *
 * ```ts
 * const entities$: Read<EntityData[]> = readManyFrom(queryEntity, ['id1', 'id2']);
 * ```
 *
 * @group Selectors
 * @typeParam S entity state used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param ids array of entity ids to select
 * @return Returns a new {@link Read} that emits a array containing all selected entities that exist.
 */
export function readManyFrom<S extends EntityState, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[],
): Read<EntityType[]>;

/**
 * Create a new {@link Read} by selecting multiple entities from a {@link @datorama/akita!QueryEntity | QueryEntity} using an array of ids
 * and extracting the value using a given projection:
 *
 * ```ts
 * const names$: Read<string[]> = readEntityFrom(queryEntity, ['id1', 'id2'], entity => entity.name);
 * ```
 *
 * @group Selectors
 * @typeParam S entity state used by the queryEntity
 * @typeParam R returned type of the projection
 * @param queryEntity QueryEntity to select from
 * @param ids array of entity ids to select
 * @param projection projection to pick from the entity
 * @return Returns a new {@link Read} that emits the result of the projection or `undefined` if the entity does not exist
 */
export function readManyFrom<S extends EntityState, R, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[],
    projection: (entity: EntityType) => R,
): Read<R[]>;
/**
 * @internal
 */
export function readManyFrom<S extends EntityState, R, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[],
    projection?: (entity: EntityType) => R,
): Read<(EntityType | R)[]> {
    if (projection == null) {
        return new Read({
            observable(): Observable<EntityType[]> {
                return queryEntity.selectMany(ids);
            },
            result(): PipeFnNext<EntityType[]> {
                return {
                    type: 'next',
                    value: ids.map((id) => queryEntity.getEntity(id)).filter(isDefined),
                };
            },
        });
    } else {
        return new Read({
            observable(): Observable<R[]> {
                return queryEntity.selectMany(ids, projection);
            },
            result(): PipeFnNext<R[]> {
                return {
                    type: 'next',
                    value: ids
                        .map((id) => queryEntity.getEntity(id))
                        .filter(isDefined)
                        .map(projection),
                };
            },
        });
    }
}
