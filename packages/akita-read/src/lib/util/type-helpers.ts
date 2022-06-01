/* eslint-disable @typescript-eslint/no-unused-vars */
export type Tail<I extends any[]> = I extends [...infer Rest, infer T]
    ? T
    : never;

export type UnaryFn<I, R> = (input: I) => R;

export type TypeOfArray<A extends readonly any[]> =
    A extends readonly (infer T)[] ? T : never;

export type MaybeUndefined<T, Con extends boolean> = Con extends true
    ? T | undefined
    : T;

export type And<B extends boolean> = true extends B ? true : false;
