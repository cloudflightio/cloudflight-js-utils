import {LogConsumer} from './model/log-consumer';
import {createLogger} from './create-logger';
import {LoggerAccessor} from './global-access';
import {describe, expect} from 'vitest';

describe('globalAccess', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const globalObject = global as unknown as LoggerAccessor;

    test('given logger when accessing global loggers then logger exists', () => {
        createLogger({accessKey: 'test-logger-1'});

        expect(globalObject.loggerAccessor.loggerByKey('test-logger-1')).toBeDefined();
    });

    test('given consumer when accessing global consumers then consumer exists', () => {
        const logger = createLogger({accessKey: 'test-logger-2'});
        const consumer: LogConsumer = {
            get accessKey(): string {
                return 'test-consumer-1';
            },
            logLevel: undefined,
            consume: () => {
                // do nothing
            },
        };

        logger.addConsumer(consumer);

        expect(globalObject.loggerAccessor.consumerByKey('test-consumer-1')).toBeDefined();
    });
});
