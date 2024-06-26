import {Inject, Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, of} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {MediaMatcher} from './media-matcher';
import {Breakpoint, Breakpoints, breakpointsInjectionToken} from '../model/breakpoints';

type IsDisplay = Record<string, BehaviorSubject<boolean>>;

type MediaQueryEventListener = (event: MediaQueryListEvent) => void;

type IsDisplayQueries = Record<string, {query: MediaQueryList; listener: MediaQueryEventListener}>;

type BreakpointEntry = [Breakpoint, number];

/**
 * Service for querying the display size programmatically.
 *
 * For the string values passed to the `isDisplay` methods please consult {@link provideIsDisplay}.
 */
@Injectable({
    providedIn: 'root',
})
export class IsDisplayService implements OnDestroy {
    private readonly isDisplayQueries: IsDisplayQueries = {};
    private readonly isDisplayState: IsDisplay = {};
    private readonly breakpointsDsc: Breakpoint[];
    private readonly breakpointsAsc: Breakpoint[];

    /**
     * @internal
     */
    public constructor(
        @Inject(breakpointsInjectionToken)
        breakpoints: Breakpoints,
        mediaMatcher: MediaMatcher,
    ) {
        const entries: BreakpointEntry[] = Object.entries(breakpoints)
            .map((entry) => {
                ensureValidBreakpointEntry(entry);
                return entry;
            })
            .sort((a, b) => b[1] - a[1]); // sort descending
        this.breakpointsDsc = entries.map(([name]) => name);
        this.breakpointsAsc = [...this.breakpointsDsc].reverse();

        entries
            .map(([key, value], index, array) => ({
                key,
                // we don't want a lower limit for the smallest breakpoint
                min: index >= array.length - 1 ? undefined : value,
                max: array[index - 1]?.[1],
            }))
            .forEach(({key, min, max}) => {
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
                this.isDisplayQueries[key] = {query, listener};
            });
    }

    /**
     * @internal
     */
    public ngOnDestroy(): void {
        Object.entries(this.isDisplayQueries).forEach(([, {query, listener}]) => {
            if (query.removeEventListener != null) {
                query.removeEventListener('change', listener);
            } else {
                // use deprecated api if the new one does not exist
                query.removeListener(listener);
            }
        });
    }

    public isDisplay$(option: Breakpoint): Observable<boolean> {
        return this.isDisplayState[option]?.pipe(distinctUntilChanged()) ?? of(false);
    }

    public isDisplay(option: Breakpoint): boolean {
        return this.isDisplayState[option]?.getValue() ?? false;
    }

    public isDisplayAtLeast$(option: Breakpoint): Observable<boolean> {
        return this.combineBreakpoints$(option, this.breakpointsAsc);
    }

    public isDisplayAtLeast(option: Breakpoint): boolean {
        return this.combineBreakpoints(option, this.breakpointsAsc);
    }

    public isDisplayAtMost$(option: Breakpoint): Observable<boolean> {
        return this.combineBreakpoints$(option, this.breakpointsDsc);
    }

    public isDisplayAtMost(option: Breakpoint): boolean {
        return this.combineBreakpoints(option, this.breakpointsDsc);
    }

    private combineBreakpoints(option: Breakpoint, orderedBreakpoints: Breakpoint[]): boolean {
        const index = orderedBreakpoints.indexOf(option);
        if (index === -1) {
            return false;
        }

        const breakpoints = orderedBreakpoints.slice(index);
        const breakpointsValues = breakpoints.map((breakpoint) => this.isDisplay(breakpoint));
        return breakpointsValues.some((result) => result);
    }

    private combineBreakpoints$(option: Breakpoint, orderedBreakpoints: Breakpoint[]): Observable<boolean> {
        const index = orderedBreakpoints.indexOf(option);
        if (index === -1) {
            return of(false);
        }

        const breakpoints = orderedBreakpoints.slice(index);
        const breakpoints$ = breakpoints.map((breakpoint) => this.isDisplay$(breakpoint));
        return combineLatest(breakpoints$).pipe(
            map((results) => {
                return results.some((result) => result);
            }),
            distinctUntilChanged(),
        );
    }
}

function createMediaQuery(minWidthInclusive?: number, maxWidthExclusive?: number): string {
    let query = '';
    if (minWidthInclusive != null) {
        query = `${query}(min-width: ${String(minWidthInclusive)}px)`;
    }
    if (minWidthInclusive != null && maxWidthExclusive != null) {
        query = `${query} and `;
    }
    if (maxWidthExclusive != null) {
        // a very small number to make exclusive work
        // eslint-disable-next-line no-magic-numbers
        const maxWidth = maxWidthExclusive - 0.001;
        query = `${query}(max-width: ${String(maxWidth)}px)`;
    }
    return query;
}

function ensureValidBreakpointEntry(entry: [unknown, unknown]): asserts entry is BreakpointEntry {
    const [key, value] = entry;
    if (typeof value !== 'number') {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Breakpoints must be defined using a number value, but found: ${value} (${typeof value}) for ${key}`);
    }
}
