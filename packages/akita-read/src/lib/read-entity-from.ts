import {PipeFnNext, Read} from '@cloudflight/rxjs-read';
import {EntityState, getEntityType, getIDType, QueryEntity} from '@datorama/akita';
import {Observable} from 'rxjs';

type EntityProjection<EntityType, R = unknown> = (entity?: EntityType) => R;

/**
 * Create a new {@link Read} by selecting an entity from a {@link @datorama/akita!QueryEntity | QueryEntity} using its id:
 *
 * ```ts
 * const entity$: Read<EntityData | undefined> = readEntityFrom(queryEntity, entityId);
 * ```
 *
 * @group Selectors
 * @typeParam S entity state used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param id entity id to select
 * @return Returns a new {@link Read} that emits the selected entity or undefined if the entity does not exist
 */
export function readEntityFrom<S extends EntityState, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    id: IDType,
): Read<EntityType | undefined>;

/**
 * Create a new {@link Read} by selecting an entity from a {@link @datorama/akita!QueryEntity | QueryEntity} using its id
 * and extracting the value using a given key:
 *
 * ```ts
 * const name$: Read<string | undefined> = readEntityFrom(queryEntity, entityId, 'name');
 * ```
 *
 * @group Selectors
 * @typeParam S entity state used by the queryEntity
 * @typeParam K key of the entity
 * @param queryEntity QueryEntity to select from
 * @param id entity id to select
 * @param key key to extract from the entity
 * @return Returns a new {@link Read} that emits extracted value of the selected entity or undefined if the entity does not exist
 */
export function readEntityFrom<S extends EntityState, K extends keyof EntityType, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    id: IDType,
    key: K,
): Read<EntityType[K] | undefined>;

/**
 * Create a new {@link Read} by selecting an entity from a {@link @datorama/akita!QueryEntity | QueryEntity} using its id
 * and extracting the value using a given projection:
 *
 * ```ts
 * const name$: Read<string | undefined> = readEntityFrom(queryEntity, entityId, entity => entity.name);
 * ```
 *
 * @group Selectors
 * @typeParam S entity state used by the queryEntity
 * @typeParam R returned type of the projection
 * @param queryEntity QueryEntity to select from
 * @param id entity id to select
 * @param projection projection to pick from the entity
 * @return Returns a new {@link Read} that emits the result of the projection or `undefined` if the entity does not exist
 */
export function readEntityFrom<S extends EntityState, R, EntityType = getEntityType<S>, IDType = getIDType<S>>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    id: IDType,
    projection: (entity?: EntityType) => R,
): Read<R | undefined>;
/**
 * @internal
 */
export function readEntityFrom<
    S extends EntityState,
    K extends keyof EntityType,
    R = unknown,
    EntityType = getEntityType<S>,
    IDType = getIDType<S>,
>(queryEntity: QueryEntity<S, EntityType, IDType>, id: IDType, keyOrProject?: K | EntityProjection<EntityType, R>): Read<unknown> {
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
                const entity = queryEntity.getEntity(id);
                let value;
                if (entity != null) {
                    // the types of Akita state that the projection should handle if the entity does not exist, but in the implementation
                    // (https://github.com/salesforce/akita/blob/d879000c4586319d3fe62761af3abea7a48b2fb7/packages/akita/src/lib/queryEntity.ts#L155)
                    // the projection is never called if it does not. So we also don't call the projection.
                    value = keyOrProject(entity);
                }

                return {
                    type: 'next',
                    value,
                };
            },
        });
    }

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
