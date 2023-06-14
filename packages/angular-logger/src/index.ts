export {LoggerModule} from './lib/logger.module';

export {Logger} from './lib/model/logger';

export {
    createConsoleConsumer,
    createNoopConsumer,
    LogConsumer,
    LogLevel,
    globalLogger,
    createLogger,
    NamedLogger,
    createNamedLogger,
    LoggerCreationConfig,
} from '@cloudflight/logger';
