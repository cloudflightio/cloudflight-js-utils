import {LogLevel} from './log-level';
import {LogConsumer} from './log-consumer';

export interface Logger {
    readonly accessKey: string;
    logLevel: LogLevel;

    debug(source: string, ...messages: unknown[]): void;

    info(source: string, ...messages: unknown[]): void;

    warn(source: string, ...messages: unknown[]): void;

    error(source: string, ...messages: unknown[]): void;

    addConsumer(consumer: LogConsumer): void;
}
