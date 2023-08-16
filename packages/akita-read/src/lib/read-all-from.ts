import {PipeFnNext, Read} from '@cloudflight/rxjs-read';
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
import {Observable} from 'rxjs';

/**
 * Create a new {@link Read} containing an array of all entities in the used {@link @datorama/akita!QueryEntity | QueryEntity}:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity);
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @return Returns a new {@link Read} that emits an array containing all entities in the QueryEntity.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(queryEntity: QueryEntity<S>): Read<EntityType[]>;

/**
 * Create a new {@link Read} containing an object with all entities in the used {@link @datorama/akita!QueryEntity | QueryEntity}:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity, { asObject: true });
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param options options on how to select the entities.
 * Check [Akita-Documentation](https://opensource.salesforce.com/akita/docs/entities/query-entity#selectall) for more infos.
 * @return Returns a new {@link Read} that emits an object with all entities in the QueryEntity.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options: SelectAllOptionsA<EntityType>,
): Read<HashMap<EntityType>>;

/**
 * Create a new {@link Read} containing an array of all entities in the used
 * {@link @datorama/akita!QueryEntity | QueryEntity} after applying the filter:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity, { filterBy: entity => entity.done });
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param options options on how to select the entities.
 * Check [Akita-Documentation](https://opensource.salesforce.com/akita/docs/entities/query-entity#selectall) for more infos.
 * @return Returns a new {@link Read} that emits an array of all entities in the QueryEntity passing the filter function.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options: SelectAllOptionsB<EntityType>,
): Read<EntityType[]>;

/**
 * Create a new {@link Read} containing an object with all entities in the used {@link @datorama/akita!QueryEntity | QueryEntity}:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity, { asObject: true });
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param options options on how to select the entities.
 * Check [Akita-Documentation](https://opensource.salesforce.com/akita/docs/entities/query-entity#selectall) for more infos.
 * @return Returns a new {@link Read} that emits an object with all entities in the QueryEntity.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options: SelectAllOptionsC<EntityType>,
): Read<HashMap<EntityType>>;

/**
 * Create a new {@link Read} containing an array of all entities in the used
 * {@link @datorama/akita!QueryEntity | QueryEntity} limiting the count to the limit provided:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity, { limitTo: 5 });
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param options options on how to select the entities.
 * Check [Akita-Documentation](https://opensource.salesforce.com/akita/docs/entities/query-entity#selectall) for more infos.
 * @return Returns a new {@link Read} that emits an array of all entities in the QueryEntity up to the limit.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options: SelectAllOptionsD<EntityType>,
): Read<EntityType[]>;

/**
 * Create a new {@link Read} containing an array of all entities in the used
 * {@link @datorama/akita!QueryEntity | QueryEntity} sorted by the key:
 *
 * ```ts
 * const entities$: Read<EntityState[]> = readAllFrom(queryEntity, { sortBy: 'price', sortByOrder: Order.ASC });
 * ```
 *
 * @group Selectors
 * @typeParam S entity stated used by the queryEntity
 * @param queryEntity QueryEntity to select from
 * @param options options on how to select the entities.
 * Check [Akita-Documentation](https://opensource.salesforce.com/akita/docs/entities/query-entity#selectall) for more infos.
 * @return Returns a new {@link Read} that emits an array of all entities in the QueryEntity ordered according to the passed options.
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options: SelectAllOptionsE<EntityType>,
): Read<EntityType[]>;
/**
 * @internal
 */
export function readAllFrom<S extends EntityState, EntityType = getEntityType<S>>(
    queryEntity: QueryEntity<S>,
    options?: SelectOptions<EntityType>,
): Read<EntityType[] | HashMap<EntityType>> {
    if (options == null) {
        return new Read({
            observable(): Observable<EntityType[]> {
                return queryEntity.selectAll();
            },
            result(): PipeFnNext<EntityType[]> {
                return {type: 'next', value: queryEntity.getAll()};
            },
        });
    }

    return new Read({
        observable(): Observable<EntityType[] | HashMap<EntityType>> {
            return queryEntity.selectAll(options);
        },
        result(): PipeFnNext<EntityType[] | HashMap<EntityType>> {
            return {type: 'next', value: queryEntity.getAll(options)};
        },
    });
}
