import { Observable } from 'rxjs';
import { PipeFnNext, PipeFnResult } from '../pipe/pipe';
import { And, UnaryFn } from './type-helpers';

export interface ContinuingPipeOperator<I, R> {
  observableOperator: UnaryFn<Observable<I>, Observable<R>>;
  valueOperator: UnaryFn<I, PipeFnNext<R>>;
}

export interface CancellingPipeOperator<I, R> {
  observableOperator: UnaryFn<Observable<I>, Observable<R>>;
  valueOperator: UnaryFn<I, PipeFnResult<R>>;
}

export type MaybeCancellingPipeOperator<
  I,
  R,
  B extends boolean = false
> = true extends B
  ? CancellingPipeOperator<I, R>
  : ContinuingPipeOperator<I, R>;

export type PipeOperator<I, R> =
  | ContinuingPipeOperator<I, R>
  | CancellingPipeOperator<I, R>;

export type IsCancellingPipeOperator<Operator extends PipeOperator<any, any>> =
  ReturnType<Operator['valueOperator']> extends PipeFnNext<any> ? false : true;

export type ContainsCancellingPipeOperator<
  Operators extends PipeOperator<any, any>[],
  Length extends number = Operators['length']
> = Length extends 1
  ? IsCancellingPipeOperator<Operators[0]>
  : Operators extends [infer First, ...infer Rest]
  ? First extends PipeOperator<any, any>
    ? Rest extends PipeOperator<any, any>[]
      ? And<
          IsCancellingPipeOperator<First> | ContainsCancellingPipeOperator<Rest>
        >
      : never
    : never
  : never;
