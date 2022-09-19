/**
 * Setting the log level with change what is filtered and not.
 * For example, a log level of `Warn` will filter out info and debug logs
 * but let warn and error logs pass.
 */
export const enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
  Disabled,
}
