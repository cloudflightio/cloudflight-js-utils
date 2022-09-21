import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { MediaMatcher } from './media-matcher';
import { Breakpoints, breakpointsInjectionToken } from '../model/breakpoints';
import { DOCUMENT } from '@angular/common';

type IsDisplay = Record<string, BehaviorSubject<boolean>>;

type MediaQueryEventListener = (event: MediaQueryListEvent) => void;

type IsDisplayQueries = Record<
  string,
  { query: MediaQueryList; listener: MediaQueryEventListener }
>;

/**
 * Service for querying the display size programmatically.
 *
 * For the string values passed to the `isDisplay` methods please consult {@link DisplayModule}.
 */
@Injectable({
  providedIn: 'root',
})
export class IsDisplayService implements OnDestroy {
  private readonly isDisplayQueries: IsDisplayQueries = {};
  private readonly isDisplayState: IsDisplay = {};

  /**
   * @internal
   */
  public constructor(
    @Inject(breakpointsInjectionToken)
    breakpoints: Breakpoints,
    mediaMatcher: MediaMatcher,
    @Inject(DOCUMENT) document: Document
  ) {
    const entries = Object.entries(breakpoints).sort((a, b) => b[1] - a[1]); // sort descending

    entries.forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--breakpoint-${key}`,
        `${value}px`
      );
    });

    entries
      .map(([key, value], index, array) => ({
        key,
        // we don't want a lower limit for the smallest breakpoint
        min: index >= array.length - 1 ? undefined : value,
        max: array[index - 1]?.[1],
      }))
      .forEach(({ key, min, max }) => {
        const query = mediaMatcher.matchMedia(createMediaQuery(min, max));

        this.isDisplayState[key] = new BehaviorSubject<boolean>(query.matches);

        const listener: MediaQueryEventListener = (event) => {
          this.isDisplayState[key]?.next(event.matches);
        };
        if (query.addEventListener != null) {
          query.addEventListener('change', listener);
        } else {
          // use deprecated api if the new one does not exist
          query.addListener(listener);
        }
        this.isDisplayQueries[key] = { query, listener };
      });
  }

  /**
   * @internal
   */
  public ngOnDestroy(): void {
    Object.entries(this.isDisplayQueries).forEach(([, { query, listener }]) => {
      if (query.removeEventListener != null) {
        query.removeEventListener('change', listener);
      } else {
        // use deprecated api if the new one does not exist
        query.removeListener(listener);
      }
    });
  }

  public isDisplay$(option: string): Observable<boolean> {
    return (
      this.isDisplayState[option]?.pipe(distinctUntilChanged()) ?? of(false)
    );
  }

  public isDisplay(option: string): boolean {
    return this.isDisplayState[option]?.getValue() ?? false;
  }
}

function createMediaQuery(
  minWidthInclusive?: number,
  maxWidthExclusive?: number
): string {
  let query = '';
  if (minWidthInclusive != null) {
    query = `${query}(min-width: ${minWidthInclusive}px)`;
  }
  if (minWidthInclusive != null && maxWidthExclusive != null) {
    query = `${query} and `;
  }
  if (maxWidthExclusive != null) {
    const maxWidth = maxWidthExclusive - 0.001;
    query = `${query}(max-width: ${maxWidth}px)`;
  }
  return query;
}
