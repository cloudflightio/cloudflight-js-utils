import {PipeFnNext} from '../pipe/pipe';

export function identityValueOperator<T>(value: T): PipeFnNext<T> {
    return {
        type: 'next',
        value,
    };
}
