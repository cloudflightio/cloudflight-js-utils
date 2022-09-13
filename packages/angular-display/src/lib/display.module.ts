import { ModuleWithProviders, NgModule } from '@angular/core';
import { IsDisplayDirective } from './directive/is-display.directive';
import { Breakpoints, breakpointsInjectionToken } from './model/breakpoints';

@NgModule({
  declarations: [IsDisplayDirective],
  exports: [IsDisplayDirective],
})
export class DisplayModule {
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
