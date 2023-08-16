import {TestBed} from '@angular/core/testing';
import {LogConsumer, LogLevel} from '@cloudflight/logger';
import {LoggerModule} from './logger.module';
import {Logger} from './model/logger';
import {createSpyFromClass} from 'jest-auto-spies';

class LogConsumerImpl implements LogConsumer {
    public accessKey = 'test-logger-key';
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

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(consumer.consume).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(consumer.consume).toHaveBeenLastCalledWith('source', LogLevel.Debug, ['message']);
    });
});
