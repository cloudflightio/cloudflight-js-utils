import {ModuleWithProviders, NgModule} from '@angular/core';
import {IsDisplayDirective} from './directive/is-display.directive';
import {provideIsDisplay} from './display.provider';
import {Breakpoints} from './model/breakpoints';
import {IsDisplayPipe} from './pipe/is-display.pipe';

/**
 * @deprecated prefer to use the standalone configuration. see {@link provideIsDisplay}
 * @see {@link provideIsDisplay}
 */
@NgModule({
    imports: [IsDisplayDirective, IsDisplayPipe],
    exports: [IsDisplayDirective, IsDisplayPipe],
})
export class DisplayModule {
    /**
     * @deprecated prefer to use the standalone configuration. see {@link provideIsDisplay}
     * @see {@link provideIsDisplay}
     */
    public static forRoot(breakpoints: Breakpoints): ModuleWithProviders<DisplayModule> {
        return {
            ngModule: DisplayModule,
            providers: [provideIsDisplay(breakpoints)],
        };
    }
}
