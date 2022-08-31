import { LogConsumer, Logger as LoggerInterface, LogLevel } from '@cloudflight/logger';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class Logger implements LoggerInterface {
  public abstract logLevel: LogLevel;

  public abstract addConsumer(consumer: LogConsumer): void;

  public abstract debug(source: string | unknown, ...messages: unknown[]): void;

  public abstract error(source: string | unknown, ...messages: unknown[]): void;

  public abstract info(source: string | unknown, ...messages: unknown[]): void;

  public abstract warn(source: string | unknown, ...messages: unknown[]): void;
}
