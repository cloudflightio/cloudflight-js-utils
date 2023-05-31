import {createLogger} from './create-logger';
import {LogConsumer} from './model/log-consumer';
import {LogLevel} from './model/log-level';
import Mock = jest.Mock;

interface MockedConsumer extends LogConsumer {
    consume: Mock<LogConsumer['consume']>;
}

describe('createLogger', () => {
    let consumer: MockedConsumer;

    beforeEach(() => {
        consumer = {
            get accessKey(): string {
                return 'default-test-consumer';
            },
            logLevel: undefined,
            consume: jest.fn(),
        };
    });

    test('given consumer when logging then consumer gets called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        logger.debug('source', 'message');

        expect(consumer.consume).toHaveBeenCalledTimes(1);
        expect(consumer.consume).toHaveBeenLastCalledWith('source', LogLevel.Debug, ['message']);
    });

    test('given consumer level changing when logging then consumer does not get called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        consumer.logLevel = LogLevel.Error;

        logger.debug('source', 'message');

        expect(consumer.consume).toHaveBeenCalledTimes(0);
    });

    test('given logger level changing when logging then consumer does not get called', () => {
        const logger = createLogger({accessKey: 'default-test-logger'});

        logger.addConsumer(consumer);

        logger.logLevel = LogLevel.Error;

        logger.debug('source', 'message');

        expect(consumer.consume).toHaveBeenCalledTimes(0);
    });
});
