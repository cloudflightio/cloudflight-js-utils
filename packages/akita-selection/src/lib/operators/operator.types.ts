/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from 'rxjs';
import { Tail, UnaryFn } from '../type-helpers';

export interface PipeOperator<I, R> {
    observableOperator: UnaryFn<Observable<I>, Observable<R>>;
    valueOperator: UnaryFn<I, R>;
}

export type ReturnTypeOfTailOperator<
    Operators extends PipeOperator<any, any>[]
> = Tail<Operators> extends PipeOperator<any, infer R> ? R : never;

export type OperatorPipeline<
    T,
    Operators extends PipeOperator<any, any>[],
    Length extends number = Operators['length']
> = Length extends 1
    ? Operators extends [PipeOperator<any, infer FR>]
        ? [PipeOperator<T, FR>]
        : never
    : Operators extends [infer First, infer Second, ...infer Rest]
    ? [
          First extends PipeOperator<any, infer FR>
              ? PipeOperator<T, FR>
              : never,
          ...OperatorPipeline<
              First extends PipeOperator<any, infer FR> ? FR : never,
              First extends PipeOperator<any, infer FR>
                  ? Second extends PipeOperator<any, infer SR>
                      ? Rest extends PipeOperator<any, any>[]
                          ? [PipeOperator<FR, SR>, ...Rest]
                          : never
                      : never
                  : never
          >
      ]
    : Operators;
