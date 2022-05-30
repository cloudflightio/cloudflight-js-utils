import { Tail, UnaryFn } from '../util/type-helpers';

export interface PipeFnNext<T> {
    type: 'next';
    value: T;
}

export interface PipeFnCancel {
    type: 'cancel';
    value: undefined;
}

export type PipeFnResult<T> = PipeFnNext<T> | PipeFnCancel;

export type ReturnTypeOfTail<
    Operators extends UnaryFn<any, PipeFnResult<any>>[]
> = Tail<Operators> extends UnaryFn<any, infer PR>
    ? PR extends PipeFnResult<infer R>
        ? R
        : never
    : never;

// credits to https://github.com/drizzer14/fnts/blob/e2227887002047cbe058d8882adb8ed778e84880/src/pipe.ts
export type Pipeline<
    Functions extends UnaryFn<any, PipeFnResult<any>>[],
    Length extends number = Functions['length']
> = Length extends 1
    ? Functions
    : Functions extends [infer First, infer Second, ...infer Rest]
    ? [
          First,
          ...Pipeline<
              First extends UnaryFn<any, infer FPR>
                  ? FPR extends PipeFnResult<infer FR>
                      ? Second extends UnaryFn<any, PipeFnResult<infer SR>>
                          ? Rest extends UnaryFn<any, PipeFnResult<any>>[]
                              ? [(arg: FR) => SR, ...Rest]
                              : never
                          : never
                      : never
                  : never
          >
      ]
    : Functions;

export function pipe<Functions extends Array<(arg: any) => PipeFnResult<any>>>(
    ...functions: Pipeline<Functions>
): (
    arg: Parameters<Functions[0]>[0]
) => PipeFnResult<ReturnTypeOfTail<Functions>> {
    return (arg) => {
        const length = functions.length;

        let pipeline = arg;

        for (let index = 0; index < length; index += 1) {
            const result = functions[index](pipeline);
            if (result.type === 'cancel') {
                return result;
            }
            pipeline = result.value;
        }

        return {
            type: 'next',
            value: pipeline,
        };
    };
}
