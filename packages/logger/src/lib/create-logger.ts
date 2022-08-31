import { LogConsumer } from './model/log-consumer';
import { Logger } from './model/logger';
import { LogLevel } from './model/log-level';
import { nameOf } from './logger-class-support';

export function createLogger(): Logger {
  const consumers: LogConsumer[] = [];
  let logLevel = LogLevel.Debug;

  return {
    get logLevel() {
      return logLevel;
    },
    set logLevel(level: LogLevel) {
      logLevel = level;
    },
    addConsumer(consumer: LogConsumer): void {
      consumers.push(consumer);
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
}
