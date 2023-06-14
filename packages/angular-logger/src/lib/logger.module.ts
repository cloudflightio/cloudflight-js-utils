import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {Logger} from './model/logger';
import {globalLogger, LogConsumer} from '@cloudflight/logger';

export interface LoggerModuleConfig {
    consumers: LogConsumer[];
}

@NgModule()
export class LoggerModule {
    public static forRoot(config: LoggerModuleConfig): ModuleWithProviders<LoggerModule> {
        return {
            ngModule: LoggerModule,
            providers: [
                {
                    provide: Logger,
                    useValue: globalLogger,
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
