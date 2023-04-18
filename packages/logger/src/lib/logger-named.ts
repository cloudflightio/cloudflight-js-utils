import {LogConsumer} from './model/log-consumer';
import {LogLevel} from './model/log-level';
import {globalLoggerInstance} from './logger-global';

export interface NamedLogger {
    logLevel: LogLevel;

    debug(...messages: unknown[]): void;

    info(...messages: unknown[]): void;

    warn(...messages: unknown[]): void;

    error(...messages: unknown[]): void;

    addConsumer(consumer: LogConsumer): void;
}

export function createNamedLogger(name: string, logger = globalLoggerInstance): NamedLogger {
    return {
        get logLevel() {
            return logger.logLevel;
        },
        set logLevel(level: LogLevel) {
            logger.logLevel = level;
        },
        addConsumer: logger.addConsumer.bind(logger),
        debug(...messages: unknown[]): void {
            logger.debug(name, ...messages);
        },
        info(...messages: unknown[]): void {
            logger.info(name, ...messages);
        },
        warn(...messages: unknown[]): void {
            logger.warn(name, ...messages);
        },
        error(...messages: unknown[]): void {
            logger.error(name, ...messages);
        },
    };
}
