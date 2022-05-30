import { Read } from '../read';
import { And } from './type-helpers';

export type IsCancellingRead<T extends Read<any, any>> = T extends Read<
    any,
    infer R
>
    ? R
    : never;

export type ContainsCancellingRead<
    Operators extends Read<any, any>[],
    Length extends number = Operators['length']
> = Length extends 1
    ? IsCancellingRead<Operators[0]>
    : Operators extends [infer First, ...infer Rest]
    ? First extends Read<any, any>
        ? Rest extends Read<any, any>[]
            ? And<IsCancellingRead<First> | ContainsCancellingRead<Rest>>
            : never
        : never
    : never;
