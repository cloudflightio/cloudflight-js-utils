import { LogConsumer } from './model/log-consumer';
import { Logger } from './model/logger';
import { LogLevel } from './model/log-level';
import { nameOf } from './logger-class-support';
import { addConsumer, addLogger } from './global-access';

export interface LoggerCreationConfig {
  accessKey: string;
}

export function createLogger(config: LoggerCreationConfig): Logger {
  const consumers = new Set<LogConsumer>();
  let logLevel = LogLevel.Debug;

  const logger: Logger = {
    get accessKey(): string {
      return config.accessKey;
    },
    get logLevel() {
      return logLevel;
    },
    set logLevel(level: LogLevel) {
      logLevel = level;
    },
    addConsumer(consumer: LogConsumer): void {
      addConsumer(consumer);
      consumers.add(consumer);
    },
    debug(source: string | unknown, ...messages: unknown[]): void {
      if (logLevel > LogLevel.Debug) {
        return;
      }

      const name = typeof source === 'string' ? source : nameOf(source);

      for (const consumer of consumers) {
        if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Debug) {
          consumer.consume(name, LogLevel.Debug, messages);
        }
      }
    },
    info(source: string | unknown, ...messages: unknown[]): void {
      if (logLevel > LogLevel.Info) {
        return;
      }

      const name = typeof source === 'string' ? source : nameOf(source);
      for (const consumer of consumers) {
        if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Info) {
          consumer.consume(name, LogLevel.Info, messages);
        }
      }
    },
    warn(source: string | unknown, ...messages: unknown[]): void {
      if (logLevel > LogLevel.Warn) {
        return;
      }

      const name = typeof source === 'string' ? source : nameOf(source);
      for (const consumer of consumers) {
        if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Warn) {
          consumer.consume(name, LogLevel.Warn, messages);
        }
      }
    },
    error(source: string | unknown, ...messages: unknown[]): void {
      if (logLevel > LogLevel.Error) {
        return;
      }

      const name = typeof source === 'string' ? source : nameOf(source);
      for (const consumer of consumers) {
        if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Error) {
          consumer.consume(name, LogLevel.Error, messages);
        }
      }
    },
  };

  addLogger(logger);

  return logger;
}
