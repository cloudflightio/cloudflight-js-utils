import { Observable } from 'rxjs';
import { PipeFnNext, PipeFnResult } from './pipe/pipe';

export interface ContinuingReadProvider<T> {
  observable(): Observable<T>;

  result(): PipeFnNext<T>;
}

export interface CancellingReadProvider<T> {
  observable(): Observable<T>;

  result(): PipeFnResult<T>;
}

export type MaybeCancellingReadProvider<T, B extends boolean> = B extends true
  ? CancellingReadProvider<T>
  : ContinuingReadProvider<T>;

export class EagerObservableReadProvider<T, Cancelling extends boolean>
  implements CancellingReadProvider<T>
{
  private readonly obs: Observable<T>;

  public constructor(
    private readonly provider: MaybeCancellingReadProvider<T, Cancelling>
  ) {
    this.obs = this.provider.observable();
  }

  public observable(): Observable<T> {
    return this.obs;
  }

  public result(): PipeFnResult<T> {
    return this.provider.result();
  }
}
