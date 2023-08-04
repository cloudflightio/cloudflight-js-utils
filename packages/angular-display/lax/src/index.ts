// eslint-disable-next-line @nx/enforce-module-boundaries
export * from '@cloudflight/angular-display';

/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-empty-interface */
declare global {
    export namespace ClfIsDisplay {
        /**
         * Redefines Breakpoints to disable type-safety.
         * Prefer to use the typesafe option of this library. see {@link @cloudflight/angular-display#ClfIsDisplay.Breakpoints}
         */
        export interface Breakpoints extends Record<string, number> {}
    }
}
/* eslint-enable */
