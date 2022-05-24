/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
export type Tail<I extends any[]> = I extends [...infer Rest, infer T]
    ? T
    : never;

export type UnaryFn<I, R> = (input: I) => R;
