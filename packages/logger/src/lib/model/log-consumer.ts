import {LogLevel} from './log-level';

export interface LogConsumer {
    readonly accessKey: string;
    logLevel?: LogLevel;

    consume(name: string, level: LogLevel, messages: unknown[]): void;
}
