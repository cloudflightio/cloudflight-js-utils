import {LogConsumer} from './model/log-consumer';
import {Logger} from './model/logger';
import {LogLevel} from './model/log-level';
import {addConsumer, addLogger} from './global-access';

export interface LoggerCreationConfig {
    accessKey: string;
}

/**
 * Creates a new logger instance with no consumers attached. This is most
 * probably not what you want in 99% of the cases. It is recommended to use
 * the {@link globalLogger} for logging, since it has your log
 * consumers attached.
 *
 * The reason this function is exposed is so ui fragments (think of something
 * like google maps) can use this to have their logs separated. This usecase is
 * rare, but still exists in large business applications.
 */
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
        debug(source: string, ...messages: unknown[]): void {
            if (logLevel > LogLevel.Debug) {
                return;
            }

            for (const consumer of consumers) {
                if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Debug) {
                    consumer.consume(source, LogLevel.Debug, messages);
                }
            }
        },
        info(source: string, ...messages: unknown[]): void {
            if (logLevel > LogLevel.Info) {
                return;
            }

            for (const consumer of consumers) {
                if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Info) {
                    consumer.consume(source, LogLevel.Info, messages);
                }
            }
        },
        warn(source: string, ...messages: unknown[]): void {
            if (logLevel > LogLevel.Warn) {
                return;
            }

            for (const consumer of consumers) {
                if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Warn) {
                    consumer.consume(source, LogLevel.Warn, messages);
                }
            }
        },
        error(source: string, ...messages: unknown[]): void {
            if (logLevel > LogLevel.Error) {
                return;
            }

            for (const consumer of consumers) {
                if (consumer.logLevel == null || consumer.logLevel <= LogLevel.Error) {
                    consumer.consume(source, LogLevel.Error, messages);
                }
            }
        },
    };

    addLogger(logger);

    return logger;
}
