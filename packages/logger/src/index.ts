export {createLogger, type LoggerCreationConfig} from './lib/create-logger';
export {globalLogger} from './lib/logger-global';
export {type NamedLogger, createNamedLogger} from './lib/logger-named';

export {createNoopConsumer} from './lib/consumers/noop-consumer';
export {createConsoleConsumer} from './lib/consumers/console-consumer';

export {type Logger} from './lib/model/logger';
export {type LogConsumer} from './lib/model/log-consumer';
export {LogLevel} from './lib/model/log-level';
