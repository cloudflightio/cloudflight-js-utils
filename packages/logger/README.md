# logger

[![@cloudflight/logger](https://img.shields.io/npm/v/@cloudflight/logger?label=@cloudflight/logger)](https://www.npmjs.com/package/@cloudflight/logger)

Extensible logging facility for the browser and Node.js.

## Installation

```shell
npm install --save @cloudflight/logger
# or
yarn add @cloudflight/logger
# or
pnpm add @cloudflight/logger
```

## Usage

```ts
import {globalLogger} from '@cloudflight/logger';

globalLogger.info('HAL', `I'm sorry Dave. I'm afraid I can't do that.`);
```

### Named logger

The first parameter to any logging method is the source of the log. It can be a hassle and maintenance burden to
do that every time. Thus, the named logger is born to abstract it away.

```ts
import {createNamedLogger} from '@cloudflight/logger';

const namedLogger = createNamedLogger('HAL');

namedLogger.info(`I'm sorry Dave. I'm afraid I can't do that.`);

class HAL {
    private readonly namedLogger = createNamedLogger('HAL');

    public apologize(): void {
        this.namedLogger.info(`I'm sorry Dave. I'm afraid I can't do that.`);
    }
}
```

### Consumers

The extensibility of the logger comes from consumers.

#### What is a consumer?

A consumer takes the log messages and sends them to a target that can deal with them.
For example the console consumer exposed by the lib just prints the logs onto the console.
Consumers can be written for firebase, graylog and others.

#### Default Consumer

Loggers initially **do not** have any consumers. Meaning, nothing happens if they are used as is, not even console
outputs will exist. Do not forget to set up consumers in your setup file. Below is an example that sets up a console
consumer.

```ts
import {createConsoleConsumer, globalLogger} from '@cloudflight/logger';

globalLogger.addConsumer(createConsoleConsumer());
```

### Understanding log levels

If you have dug a little into the api documentation then you would have noticed that both the logger and the
consumer have log levels. If the logger is set to `LogLevel.Info` and the consumer to `LogLevel.Warn` then the
consumer won't get any messages of level `Info`. The purpose of this architecture is to allow granular control.
Having many consumers does not mean every consumer is interested in the same messages. For example in case of
a production bug you might want to lower the log level of the console consumer, but leave the consumer that
sends the logs to your backend as is, to reduce network traffic.

### Global access

To troubleshoot production problems, being able to change the log level at runtime can be of huge help. This
functionality can be implemented by having the backend set the level and communicate via the websocket
or page reload. Another way is to attach some functionality to the global object. The backend approach is
out of the reach of this library. On the other hand, the client side approach is implemented.

The global accessor is `window.loggerAccessor` (or `global.loggerAccessor` on nodejs).
`window.loggerAccessor.loggerByKey('global-logger')` for example returns the global logger instance.
The whole interface is as follows:

```ts
interface LoggerAccessor {
    loggerAccessor: {
        loggerByKey(key: string): Logger | undefined;
        consumerByKey(key: string): LogConsumer | undefined;
    };
}
```

Here, the `key` parameter should be the value of the property `accessKey` from loggers and consumers.
