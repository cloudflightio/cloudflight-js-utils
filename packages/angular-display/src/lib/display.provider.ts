import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {Breakpoints, breakpointsInjectionToken} from './model/breakpoints';

/**
 * Configures names and sizes of breakpoints used by this module. For example
 * ```ts
 * {
 *   small: 480,
 *   medium: 800,
 *   big: 1024,
 * };
 * ```
 *
 * These names can then be used for {@link IsDisplayDirective}, {@link IsDisplayPipe} and {@link IsDisplayService}.
 *
 * To provide type-safety you need to define an application-specific extension using interface merging. For more information on this see {@link ClfIsDisplay.Breakpoints}
 *
 * @see {@link ClfIsDisplay.Breakpoints}
 */
export function provideIsDisplay(breakpoints: Breakpoints): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: breakpointsInjectionToken,
            useValue: breakpoints,
        },
    ]);
}
