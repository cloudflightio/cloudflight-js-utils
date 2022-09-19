import {
  LogConsumer,
  Logger as LoggerInterface,
  LogLevel,
} from '@cloudflight/logger';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class Logger implements LoggerInterface {
  public abstract readonly accessKey: string;

  public abstract logLevel: LogLevel;

  public abstract addConsumer(consumer: LogConsumer): void;

  public abstract debug(source: string, ...messages: unknown[]): void;

  public abstract error(source: string, ...messages: unknown[]): void;

  public abstract info(source: string, ...messages: unknown[]): void;

  public abstract warn(source: string, ...messages: unknown[]): void;
}
