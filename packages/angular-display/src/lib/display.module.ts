import { ModuleWithProviders, NgModule } from '@angular/core';
import { IsDisplayDirective } from './directive/is-display.directive';
import { Breakpoints, breakpointsInjectionToken } from './model/breakpoints';

@NgModule({
  declarations: [IsDisplayDirective],
  exports: [IsDisplayDirective],
})
export class DisplayModule {
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
   * These names can then be used for {@link IsDisplayDirective} and {@link IsDisplayService}.
   */

  public static forRoot(
    breakpoints: Breakpoints
  ): ModuleWithProviders<DisplayModule> {
    return {
      ngModule: DisplayModule,
      providers: [
        {
          provide: breakpointsInjectionToken,
          useValue: breakpoints,
        },
      ],
    };
  }
}
