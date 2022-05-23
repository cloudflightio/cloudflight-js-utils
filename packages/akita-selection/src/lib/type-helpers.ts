import { Observable } from 'rxjs';

export type Fn<I, R> = (input: I) => R;

export type Head<I extends unknown[]> = I extends [infer H, ...infer Rest]
    ? H
    : never;
export type Tail<I extends unknown[]> = I extends [...infer Rest, infer T]
    ? T
    : never;

export interface PipeOperator<I, R> {
    observableOperator: Fn<Observable<I>, Observable<R>>;
    valueOperator: Fn<I, R>;
}

export type PipeFn<I, R> = (operator: PipeOperator<I, R>) => (input: I) => R;
