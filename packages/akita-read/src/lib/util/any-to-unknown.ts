// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type AnyToUnknown<T> = IfAny<T, unknown, T>;
