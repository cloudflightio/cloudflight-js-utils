/* eslint-disable max-classes-per-file */
import {IsDisplayService} from './is-display.service';
import {MediaMatcher} from './media-matcher';
import {Breakpoints} from '../model/breakpoints';
import {firstValueFrom} from 'rxjs';

class FakeMediaQueryList implements MediaQueryList {
    public constructor(public matches: boolean, public media: string) {}

    public onchange = (ev: MediaQueryListEvent): void => {
        // do nothing
    };

    /** Toggles the matches state and "emits" a change event. */
    public setMatches(matches: boolean): void {
        this.matches = matches;
        // we don't need all those other properties from the normal event type for this test
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.onchange({
            matches: this.matches,
            media: this.media,
        } as MediaQueryListEvent);
    }

    public addEventListener<K extends keyof MediaQueryListEventMap>(
        type: K,
        callback: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions,
    ): void {
        // eslint-disable-next-line @cloudflight/typescript/no-on-event-assign
        this.onchange = callback;
    }

    public addListener(listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void): void {
        this.addEventListener('change', listener);
    }

    public dispatchEvent(event: Event): boolean {
        return false;
    }

    /** Noop, but required for implementing MediaQueryList. */
    public removeEventListener<K extends keyof MediaQueryListEventMap>(
        type: K,
        listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void,
        options?: boolean | EventListenerOptions,
    ): void {
        // do nothing
    }

    public removeListener(): void {
        this.removeEventListener('change', () => {
            // do nothing
        });
    }
}

class FakeMediaMatcher implements MediaMatcher {
    private queries: Map<string, FakeMediaQueryList> = new Map();

    /** Fakes the match media response to be controlled in tests. */
    public matchMedia(query: string): FakeMediaQueryList {
        const mql = new FakeMediaQueryList(false, query);
        this.queries.set(query, mql);
        return mql;
    }

    /** Toggles the matching state of the provided query. */
    public setMatchesQuery(query: string, matches: boolean): void {
        if (this.queries.has(query)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.queries.get(query)!.setMatches(matches);
        }
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ClfIsDisplay {
        export interface Breakpoints {
            phone: number;
            tablet: number;
            desktop: number;
            invalidValueKey?: string;
        }
    }
}

describe('IsDisplayService', () => {
    const fakeMediaMatcher = new FakeMediaMatcher();
    let isDisplayService: IsDisplayService;

    beforeEach(() => {
        const breakPoints: Breakpoints = {
            phone: 480,
            tablet: 800,
            desktop: 1024,
        };

        isDisplayService = new IsDisplayService(breakPoints, fakeMediaMatcher);
    });

    describe('Given invalid configured Breakpoints', () => {
        describe('When a invalid value type is used', () => {
            const invalidBreakPoints: Breakpoints = {
                phone: 0,
                tablet: 1,
                desktop: 2,
                invalidValueKey: 'invalid',
            };

            test('should throw a error when initializing the IsDisplayService', () => {
                expect(() => new IsDisplayService(invalidBreakPoints, fakeMediaMatcher)).toThrow();
            });
        });
    });

    describe('Given the phone media query', () => {
        const query = '(max-width: 799.999px)';

        describe.each`
            matches
            ${true}
            ${false}
        `('when emitting "$matches" as matches value', ({matches}: {matches: boolean}) => {
            beforeEach(() => {
                fakeMediaMatcher.setMatchesQuery(query, matches);
            });

            test(`should return "${String(matches)}" for isDisplay('phone')`, () => {
                expect(isDisplayService.isDisplay('phone')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplay$('phone')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplay$('phone'))).resolves.toEqual(matches);
            });

            test(`should emit "false" for isDisplayAtLeast('tablet')`, () => {
                expect(isDisplayService.isDisplayAtLeast('tablet')).toEqual(false);
            });

            test(`should emit "false" for isDisplayAtLeast$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtLeast$('tablet'))).resolves.toEqual(false);
            });

            test(`should emit "${String(matches)}" for isDisplayAtMost('tablet')`, () => {
                expect(isDisplayService.isDisplayAtMost('tablet')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtMost$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtMost$('tablet'))).resolves.toEqual(matches);
            });
        });
    });

    describe('Given the tablet media query', () => {
        const query = '(min-width: 800px) and (max-width: 1023.999px)';

        describe.each`
            matches
            ${true}
            ${false}
        `('when emitting "$matches" as matches value', ({matches}: {matches: boolean}) => {
            beforeEach(() => {
                fakeMediaMatcher.setMatchesQuery(query, matches);
            });

            test(`should return "${String(matches)}" for isDisplay('tablet')`, () => {
                expect(isDisplayService.isDisplay('tablet')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplay$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplay$('tablet'))).resolves.toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtLeast('tablet')`, () => {
                expect(isDisplayService.isDisplayAtLeast('tablet')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtLeast$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtLeast$('tablet'))).resolves.toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtMost('tablet')`, () => {
                expect(isDisplayService.isDisplayAtMost('tablet')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtMost$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtMost$('tablet'))).resolves.toEqual(matches);
            });
        });
    });

    describe('Given the desktop media query', () => {
        const query = '(min-width: 1024px)';

        describe.each`
            matches
            ${true}
            ${false}
        `('when emitting "$matches" as matches value', ({matches}: {matches: boolean}) => {
            beforeEach(() => {
                fakeMediaMatcher.setMatchesQuery(query, matches);
            });

            test(`should return "${String(matches)}" for isDisplay('desktop')`, () => {
                expect(isDisplayService.isDisplay('desktop')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplay$('desktop')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplay$('desktop'))).resolves.toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtLeast('tablet')`, () => {
                expect(isDisplayService.isDisplayAtLeast('tablet')).toEqual(matches);
            });

            test(`should emit "${String(matches)}" for isDisplayAtLeast$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtLeast$('tablet'))).resolves.toEqual(matches);
            });

            test(`should emit "false" for isDisplayAtMost('tablet')`, () => {
                expect(isDisplayService.isDisplayAtMost('tablet')).toEqual(false);
            });

            test(`should emit "false" for isDisplayAtMost$('tablet')`, async () => {
                await expect(firstValueFrom(isDisplayService.isDisplayAtMost$('tablet'))).resolves.toEqual(false);
            });
        });
    });
});
