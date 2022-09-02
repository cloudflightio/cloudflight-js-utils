import { LogLevel } from './log-level';
import { LogConsumer } from './log-consumer';

export interface Logger {
  readonly accessKey: string;
  logLevel: LogLevel;

  debug(source: string | unknown, ...messages: unknown[]): void;

  info(source: string | unknown, ...messages: unknown[]): void;

  warn(source: string | unknown, ...messages: unknown[]): void;

  error(source: string | unknown, ...messages: unknown[]): void;

  addConsumer(consumer: LogConsumer): void;
}
