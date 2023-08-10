import {InjectionToken} from '@angular/core';

/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-empty-interface */
declare global {
    /**
     * This global namespace allows the using application to extend the Breakpoints type,
     * so that the whole library can be used in a typesafe way.
     *
     * Note: this mechanism was inspired by: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-serve-static-core/index.d.ts
     */
    export namespace ClfIsDisplay {
        /**
         * This interface may be extended in an application-specific manner via declaration merging.
         *
         * To do this create a .d.ts file that is added to your compilation by using the `file` or `include` property in your tsconfig.json.
         * Add the following to this file:
         *
         * ```ts
         * declare namespace ClfIsDisplay {
         *     export interface Breakpoints {
         *         some: number;
         *         breakpoint: number;
         *         definitions: number;
         *         here: number;
         *     }
         * }
         * ```
         *
         * By doing this the breakpoints and breakpoint queries you pass to this library will be completely typesafe.
         *
         * If you don't want to do this, you can instead use the relaxed version of this library that does not provide type-safety.
         * For that replace all imports of the library with the relaxed entry-point `@cloudflight/angular-display/lax`.
         */
        interface Breakpoints {}
    }
}
/* eslint-enable */

/**
 * Contains all available breakpoints definitions. To define application-specific breakpoints check {@link ClfIsDisplay.Breakpoints}
 *
 * @see {@link ClfIsDisplay.Breakpoints}
 */
export type Breakpoints = ClfIsDisplay.Breakpoints;

/**
 * Represents all available breakpoint identifiers.
 */
export type Breakpoint = keyof Breakpoints;

export const breakpointsInjectionToken = new InjectionToken<Breakpoints>('breakpointsInjectionToken ');
