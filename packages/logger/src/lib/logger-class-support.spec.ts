// eslint-disable-next-line max-classes-per-file
import { LogConsumer } from './model/log-consumer';
import { LogLevel } from './model/log-level';
import { LoggerMark } from './logger-class-support';
import { createLogger } from './create-logger';
import Mock = jest.Mock;

interface MockedConsumer extends LogConsumer {
  consume: Mock<LogConsumer['consume']>;
}

describe('ClassLogger', () => {
  let consumer: MockedConsumer;

  beforeEach(() => {
    consumer = {
      logLevel: undefined,
      consume: jest.fn(),
    };
  });

  test('given class with decorator when logging then name exists', () => {
    @LoggerMark('TestClass')
    class TestClass {}

    const logger = createLogger();

    logger.addConsumer(consumer);

    logger.debug(new TestClass(), 'lorem ipsum');

    expect(consumer.consume).toHaveBeenCalledTimes(1);
    expect(consumer.consume).toHaveBeenLastCalledWith(
      'TestClass',
      LogLevel.Debug,
      ['lorem ipsum']
    );
  });

  test('given class without decorator when logging then name is unknown', () => {
    class TestClass {}

    const logger = createLogger();

    logger.addConsumer(consumer);

    logger.debug(new TestClass(), 'lorem ipsum');

    expect(consumer.consume).toHaveBeenCalledTimes(1);
    expect(consumer.consume).toHaveBeenLastCalledWith(
      'unknown',
      LogLevel.Debug,
      ['lorem ipsum']
    );
  });
});
