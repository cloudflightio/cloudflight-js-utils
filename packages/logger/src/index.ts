export {createLogger, LoggerCreationConfig} from './lib/create-logger';
export {globalLogger} from './lib/logger-global';
export {NamedLogger, createNamedLogger} from './lib/logger-named';

export {createNoopConsumer} from './lib/consumers/noop-consumer';
export {createConsoleConsumer} from './lib/consumers/console-consumer';

export {Logger} from './lib/model/logger';
export {LogConsumer} from './lib/model/log-consumer';
export {LogLevel} from './lib/model/log-level';
