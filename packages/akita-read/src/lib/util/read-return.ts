import { Read } from '../read';

export type ReadReturn<R extends Read<any, any>> = R extends Read<
    infer Return,
    any
>
    ? Return
    : never;
