import {createLogger} from './create-logger';
import {LogConsumer} from './model/log-consumer';
import {LogLevel} from './model/log-level';
import {afterEach, beforeEach, describe, expect, it, SpyInstance, vi} from 'vitest';

describe('createLogger', () => {
    const consumer: LogConsumer = {
        get accessKey(): string {
            return 'default-test-consumer';
        },
        logLevel: undefined,
        consume: () => {
            // do nothing
        },
    };

    let spy: SpyInstance<Parameters<LogConsumer['consume']>, ReturnType<LogConsumer['consume']>> | undefined;

    beforeEach(() => {
        spy = vi.spyOn(consumer, 'consume');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('given consumer when logging then consumer gets called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        logger.debug('source', 'message');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith('source', LogLevel.Debug, ['message']);
    });

    it('given consumer level changing when logging then consumer does not get called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        consumer.logLevel = LogLevel.Error;

        logger.debug('source', 'message');

        expect(spy).toHaveBeenCalledTimes(0);
    });

    it('given logger level changing when logging then consumer does not get called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        logger.logLevel = LogLevel.Error;

        logger.debug('source', 'message');

        expect(spy).toHaveBeenCalledTimes(0);
    });
});
