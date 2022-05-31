import {
    EntityState,
    getEntityType,
    getIDType,
    QueryEntity,
} from '@datorama/akita';
import { Observable } from 'rxjs';
import { PipeFnNext } from './pipe/pipe';
import { Read } from './read';
import { isDefined } from './util/is-defined';

export function readManyFrom<
    S extends EntityState,
    EntityType = getEntityType<S>,
    IDType = getIDType<S>
>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[]
): Read<EntityType[]>;
export function readManyFrom<
    S extends EntityState,
    R,
    EntityType = getEntityType<S>,
    IDType = getIDType<S>
>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[],
    projection: (entity: EntityType) => R
): Read<R[]>;
export function readManyFrom<
    S extends EntityState,
    R,
    EntityType = getEntityType<S>,
    IDType = getIDType<S>
>(
    queryEntity: QueryEntity<S, EntityType, IDType>,
    ids: IDType[],
    projection?: (entity: EntityType) => R
): Read<(EntityType | R)[]> {
    if (projection == null) {
        return new Read({
            observable(): Observable<EntityType[]> {
                return queryEntity.selectMany(ids);
            },
            result(): PipeFnNext<EntityType[]> {
                return {
                    type: 'next',
                    value: ids
                        .map((id) => queryEntity.getEntity(id))
                        .filter(isDefined),
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
