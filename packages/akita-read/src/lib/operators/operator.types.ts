import { PipeOperator } from '../util/pipe.operator';
import { Tail } from '../util/type-helpers';

export type ReturnTypeOfTailOperator<
    Operators extends readonly PipeOperator<any, any>[]
> = Tail<Operators> extends PipeOperator<any, infer R> ? R : never;

export type OperatorPipeline<
    T,
    Operators extends readonly PipeOperator<any, any>[],
    Length extends number = Operators['length']
> = Length extends 1
    ? Operators extends readonly [PipeOperator<any, infer FR>]
        ? [PipeOperator<T, FR>]
        : never
    : Operators extends readonly [infer First, infer Second, ...infer Rest]
    ? [
          First extends PipeOperator<any, infer FR>
              ? PipeOperator<T, FR>
              : never,
          ...OperatorPipeline<
              First extends PipeOperator<any, infer FR> ? FR : never,
              First extends PipeOperator<any, infer FR>
                  ? Second extends PipeOperator<any, infer SR>
                      ? Rest extends readonly PipeOperator<any, any>[]
                          ? [PipeOperator<FR, SR>, ...Rest]
                          : never
                      : never
                  : never
          >
      ]
    : Operators;
