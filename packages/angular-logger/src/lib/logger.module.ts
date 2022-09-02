import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { Logger } from './model/logger';
import { globalLoggerInstance } from '@cloudflight/logger';
import { LogConsumer } from './model/log-consumer';

export interface LoggerModuleConfig {
  consumers: LogConsumer[];
}

@NgModule()
export class LoggerModule {
  public static forRoot(
    config: LoggerModuleConfig
  ): ModuleWithProviders<LoggerModule> {
    return {
      ngModule: LoggerModule,
      providers: [
        {
          provide: Logger,
          useValue: globalLoggerInstance,
        },
        {
          provide: APP_INITIALIZER,
          useFactory: (logger: Logger) => () => {
            config.consumers.forEach((consumer) => {
              logger.addConsumer(consumer);
            });
          },
          deps: [Logger],
          multi: true,
        },
      ],
    };
  }
}
