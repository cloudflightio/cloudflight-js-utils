import {Read} from '../read';

export type ReadReturn<R extends Read<unknown, boolean>> = R extends Read<infer Return, any> ? Return : never;
