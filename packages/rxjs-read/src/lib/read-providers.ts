import {Observable} from 'rxjs';
import {PipeFnNext, PipeFnResult} from './pipe/pipe';

/**
 * ReadProvider that will never cancel a synchronous calculation.
 *
 * @typeParam T type of the value
 */
export interface ContinuingReadProvider<T> {
    // eslint-disable-next-line rxjs/finnish
    observable(): Observable<T>;

    result(): PipeFnNext<T>;
}

/**
 * ReadProvider that might cancel a synchronous calculation.
 *
 * @typeParam T type of the value
 */
export interface CancellingReadProvider<T> {
    // eslint-disable-next-line rxjs/finnish
    observable(): Observable<T>;

    result(): PipeFnResult<T>;
}

export type MaybeCancellingReadProvider<T, B extends boolean> = B extends true ? CancellingReadProvider<T> : ContinuingReadProvider<T>;

export class EagerObservableReadProvider<T, Cancelling extends boolean> implements CancellingReadProvider<T> {
    private readonly obs$: Observable<T>;

    public constructor(private readonly provider: MaybeCancellingReadProvider<T, Cancelling>) {
        this.obs$ = this.provider.observable();
    }

    // eslint-disable-next-line rxjs/finnish
    public observable(): Observable<T> {
        return this.obs$;
    }

    public result(): PipeFnResult<T> {
        return this.provider.result();
    }
}
