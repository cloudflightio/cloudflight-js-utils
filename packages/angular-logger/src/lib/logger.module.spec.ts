import { TestBed } from '@angular/core/testing';
import {
  LogConsumer,
  Logger,
  LoggerModule,
  LogLevel,
} from '@cloudflight/angular-logger';
import { createSpyFromClass } from 'jest-auto-spies';

class LogConsumerImpl extends LogConsumer {
  public logLevel = LogLevel.Debug;

  public consume(name: string, level: LogLevel, messages: unknown[]): void {
    // do nothing
  }
}

describe('LoggerModule', () => {
  test('given default config when initialized for root then logger is set up properly', () => {
    const consumer = createSpyFromClass(LogConsumerImpl);

    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot({
          consumers: [consumer],
        }),
      ],
    });

    const logger = TestBed.inject(Logger);

    logger.debug('source', 'message');

    expect(consumer.consume).toHaveBeenCalledTimes(1);
    expect(consumer.consume).toHaveBeenLastCalledWith(
      'source',
      LogLevel.Debug,
      ['message']
    );
  });
});
