import {Logger} from './model/logger';
import {LogConsumer} from './model/log-consumer';

export interface LoggerAccessor {
    loggerAccessor: {
        loggerByKey(key: string): Logger | undefined;
        consumerByKey(key: string): LogConsumer | undefined;
    };
}

const loggers = new Map<string, Logger>();
const consumers = new Map<string, LogConsumer>();

export function addLogger(logger: Logger): void {
    loggers.set(logger.accessKey, logger);
}

export function addConsumer(consumer: LogConsumer): void {
    consumers.set(consumer.accessKey, consumer);
}

(() => {
    if (isAccessorAlreadyAttached(globalThis)) {
        return;
    }

    const accessor: LoggerAccessor['loggerAccessor'] = {
        loggerByKey(key: string): Logger | undefined {
            return loggers.get(key);
        },
        consumerByKey(key: string): LogConsumer | undefined {
            return consumers.get(key);
        },
    };

    Object.defineProperty(globalThis, 'loggerAccessor', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: accessor,
    });
})();

function isAccessorAlreadyAttached(target: unknown): target is LoggerAccessor {
    return typeof target === 'object' && target != null && Object.prototype.hasOwnProperty.call(target, 'loggerAccessor');
}
