# angular-logger

Angular wrapper for `@cloudflight/logger`.

## Installation

Add the following in your `package.json`:

```
"dependencies": {
  "@cloudflight/anglar-logger": "0.1.0"
}
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
