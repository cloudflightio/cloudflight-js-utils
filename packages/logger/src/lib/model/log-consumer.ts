import { LogLevel } from './log-level';

export interface LogConsumer {
  logLevel?: LogLevel;

  consume(name: string, level: LogLevel, messages: unknown[]): void;
}
