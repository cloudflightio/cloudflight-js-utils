export { LoggerModule } from './lib/logger.module';

export { Logger } from './lib/model/logger';
export { LogConsumer } from './lib/model/log-consumer';

export {
  createConsoleConsumer,
  createNoopConsumer,
  LoggerMark,
  LogLevel,
  globalLoggerInstance,
  createLogger,
  NamedLogger,
  createNamedLogger,
  LoggerCreationConfig,
} from '@cloudflight/logger';
