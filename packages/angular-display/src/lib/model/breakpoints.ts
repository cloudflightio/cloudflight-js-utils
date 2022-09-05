import { InjectionToken } from '@angular/core';

export type Breakpoints = Readonly<Record<string, number>>;

export const breakpointsInjectionToken = new InjectionToken<Breakpoints>(
  'breakpointsInjectionToken '
);
