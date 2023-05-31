import {Logger} from './model/logger';
import {LogConsumer} from './model/log-consumer';

declare const global: unknown;

export interface LoggerAccessor {
    loggerAccessor: {
        loggerByKey(key: string): Logger | undefined;
        consumerByKey(key: string): LogConsumer | undefined;
    };
}

const globalObject = window ?? global;
const loggers = new Map<string, Logger>();
const consumers = new Map<string, LogConsumer>();

export function addLogger(logger: Logger): void {
    loggers.set(logger.accessKey, logger);
}

export function addConsumer(consumer: LogConsumer): void {
    consumers.set(consumer.accessKey, consumer);
}

(() => {
    if (isAccessorAlreadyAttached(globalObject)) {
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

    Object.defineProperty(globalObject, 'loggerAccessor', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: accessor,
    });
})();

function isAccessorAlreadyAttached(target: unknown): target is LoggerAccessor {
    return typeof target === 'object' && target != null && Object.prototype.hasOwnProperty.call(target, 'loggerAccessor');
}
