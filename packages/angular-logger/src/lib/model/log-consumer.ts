import {
  LogConsumer as LogConsumerInterface,
  LogLevel,
} from '@cloudflight/logger';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class LogConsumer implements LogConsumerInterface {
  public abstract readonly accessKey: string;

  public abstract consume(
    name: string,
    level: LogLevel,
    messages: unknown[]
  ): void;
}
