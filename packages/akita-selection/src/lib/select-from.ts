import { Query } from '@datorama/akita';
import {
    InteropObservable,
    Observer,
    Subscribable,
    Unsubscribable,
} from 'rxjs';

export class Selection<T> implements InteropObservable<T>, Subscribable<T> {
    public constructor(private query: Query<T>) {}

    public [Symbol.observable](): Subscribable<T> {
        return this;
    }

    public subscribe(observer: Partial<Observer<T>>): Unsubscribable {
        return this.query.select().subscribe(observer);
    }

    public get sync(): T {
        return this.query.getValue();
    }
}

export function selectFrom<T>(query: Query<T>): Selection<T> {
    return new Selection<T>(query);
}
