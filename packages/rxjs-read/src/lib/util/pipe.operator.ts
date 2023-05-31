import {Observable} from 'rxjs';
import {PipeFnNext, PipeFnResult} from '../pipe/pipe';
import {And, UnaryFn} from './type-helpers';

/**
 * PipeOperator that will never cancel a synchronous calculation.
 *
 * @typeParam I type of the input value passed to the operator
 * @typeParam R type of the return value returned from the operator
 */
export interface ContinuingPipeOperator<I, R> {
    observableOperator: UnaryFn<Observable<I>, Observable<R>>;
    valueOperator: UnaryFn<I, PipeFnNext<R>>;
}

/**
 * PipeOperator that might cancel a synchronous calculation.
 *
 * @typeParam I type of the input value passed to the operator
 * @typeParam R type of the return value returned from the operator
 */
export interface CancellingPipeOperator<I, R> {
    observableOperator: UnaryFn<Observable<I>, Observable<R>>;
    valueOperator: UnaryFn<I, PipeFnResult<R>>;
}

export type MaybeCancellingPipeOperator<I, R, B extends boolean = false> = true extends B
    ? CancellingPipeOperator<I, R>
    : ContinuingPipeOperator<I, R>;

/**
 * Base type returned by a operator function used to pipe a {@link Read}
 */
export type PipeOperator<I, R> = ContinuingPipeOperator<I, R> | CancellingPipeOperator<I, R>;

export type IsCancellingPipeOperator<Operator extends PipeOperator<any, any>> = ReturnType<
    Operator['valueOperator']
> extends PipeFnNext<any>
    ? false
    : true;

export type ContainsCancellingPipeOperator<
    Operators extends PipeOperator<any, any>[],
    Length extends number = Operators['length'],
> = Length extends 1
    ? IsCancellingPipeOperator<Operators[0]>
    : Operators extends [infer First, ...infer Rest]
    ? First extends PipeOperator<any, any>
        ? Rest extends PipeOperator<any, any>[]
            ? And<IsCancellingPipeOperator<First> | ContainsCancellingPipeOperator<Rest>>
            : never
        : never
    : never;
