import { LogConsumer } from '../model/log-consumer';
import { LogLevel } from '../model/log-level';

const nextHueStep = 31;
const nameToColor = new Map<string, number>();
let hue = 0;

/**
 * Consumer to print the logs into the browser/node console with fancy colors.
 */
export function createConsoleConsumer(): LogConsumer {
  return {
    get accessKey(): string {
      return 'default-console-consumer';
    },
    logLevel: undefined,
    consume(name: string, level: LogLevel, messages: unknown[]) {
      const identifier = `%c[${name}][${getLevelName(level)}]`;
      const color = `color:white; background: hsl(${getColorFor(
        name
      )},100%,40%);padding: 4px;font-weight:bold`;

      switch (level) {
        case LogLevel.Debug:
          // eslint-disable-next-line no-console
          console.debug(identifier, color, ...messages);
          break;
        case LogLevel.Info:
          // eslint-disable-next-line no-console
          console.info(identifier, color, ...messages);
          break;
        case LogLevel.Warn:
          // eslint-disable-next-line no-console
          console.warn(identifier, color, ...messages);
          break;
        case LogLevel.Error:
          // eslint-disable-next-line no-console
          console.error(identifier, color, ...messages);
          break;
        case LogLevel.Disabled:
          // do nothing
          break;
      }
    },
  };
}

function getColorFor(name: string): number {
  const color = nameToColor.get(name);

  if (color == null) {
    hue += nextHueStep;
    nameToColor.set(name, hue);

    return hue;
  } else {
    return color;
  }
}

function getLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug:
      return 'Debug';
    case LogLevel.Info:
      return 'Info';
    case LogLevel.Warn:
      return 'Warn';
    case LogLevel.Error:
      return 'Error';
    case LogLevel.Disabled:
      return 'Disabled';
  }
}
