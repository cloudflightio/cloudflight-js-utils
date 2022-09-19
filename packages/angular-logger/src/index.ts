export { LoggerModule } from './lib/logger.module';

export { Logger } from './lib/model/logger';

export {
  createConsoleConsumer,
  createNoopConsumer,
  LogConsumer,
  LogLevel,
  globalLoggerInstance,
  createLogger,
  NamedLogger,
  createNamedLogger,
  LoggerCreationConfig,
} from '@cloudflight/logger';
