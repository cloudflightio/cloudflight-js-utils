import { LogLevel } from '../model/log-level';
import { LogConsumer } from '../model/log-consumer';

export function createNoopConsumer(): LogConsumer {
  return {
    logLevel: undefined,
    consume(name: string, level: LogLevel, messages: unknown[]) {
      // do nothing
    },
  };
}
