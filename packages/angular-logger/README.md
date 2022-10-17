# angular-logger

[![@cloudflight/angular-logger](https://img.shields.io/npm/v/@cloudflight/angular-logger?label=@cloudflight/angular-logger)](https://www.npmjs.com/package/@cloudflight/angular-logger)

Angular wrapper for `@cloudflight/logger`.

## Installation

```shell
npm install --save @cloudflight/angular-logger
# or
yarn add @cloudflight/angular-logger
# or
pnpm add @cloudflight/angular-logger
```

## Usage

### Logger injection

```ts
import { Component } from '@angular/core';

@Component({})
class HAL {
  public constructor(private readonly logger: Logger) {}

  public apoligize() {
    this.logger.info('HAL', `I'm sorry Dave. I'm afraid I can't do that.`);
  }
}
```

### Module setup

```ts
import { NgModule } from '@angular/core';
import { LoggerModule } from '@cloudflight/angular-logger';

@NgModule({
  imports: [
    LoggerModule.forRoot({
      consumers: [
        // ...
      ],
    }),
  ],
})
class AppModule {}
```

### Replacing the logger instance

```ts
import { NgModule } from '@angular/core';
import {
  globalLoggerInstance,
  LogConsumer,
  Logger,
} from '@cloudflight/angular-logger';

@NgModule({
  providers: [
    // this is the default
    {
      provide: Logger,
      useValue: globalLoggerInstance,
    },
  ],
})
class MyModule {}
```

### Adding custom consumers outside the module setup

```ts
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { LogConsumer, Logger } from '@cloudflight/angular-logger';

@NgModule({
  providers: [
    MyConsumerClass,
    {
      provide: APP_INITIALIZER,
      useFactory: (logger: Logger, consumer: MyConsumerClass) => () => {
        logger.addConsumer(consumer);
      },
      deps: [Logger, MyConsumerClass],
      multi: true,
    },
  ],
})
class MyModule {}
```
