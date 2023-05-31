import {createLogger} from './create-logger';

/**
 * Use this logger for all your needs.
 */
export const globalLoggerInstance = createLogger({
    accessKey: 'global-logger',
});
