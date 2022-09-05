/* eslint-disable max-classes-per-file */
import { IsDisplayService } from './is-display.service';
import { MediaMatcher } from './media-matcher';
import { Breakpoints } from '../model/breakpoints';
import { firstValueFrom } from 'rxjs';

class FakeMediaQueryList implements MediaQueryList {
  public onchange = (ev: MediaQueryListEvent): void => {
    // do nothing
  };

  public constructor(public matches: boolean, public media: string) {}

  /** Toggles the matches state and "emits" a change event. */
  public setMatches(matches: boolean): void {
    this.matches = matches;
    this.onchange({
      matches: this.matches,
      media: this.media,
    } as MediaQueryListEvent);
  }

  public addEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    callback: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.onchange = callback;
  }

  public addListener(
    listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
  ): void {
    this.addEventListener('change', listener);
  }

  public dispatchEvent(event: Event): boolean {
    return false;
  }

  /** Noop, but required for implementing MediaQueryList. */
  public removeEventListener<K extends keyof MediaQueryListEventMap>(
    type: K,
    listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => void,
    options?: boolean | EventListenerOptions
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
    const mql = new FakeMediaQueryList(true, query);
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

describe('IsDisplayService', () => {
  const fakeMediaMatcher = new FakeMediaMatcher();
  let isDisplayService: IsDisplayService;

  beforeEach(() => {
    const breakPoints: Breakpoints = {
      phone: 480,
      tablet: 800,
      desktop: 1024,
    };

    isDisplayService = new IsDisplayService(
      breakPoints,
      fakeMediaMatcher,
      document
    );
  });

  describe('Given the phone media query', () => {
    const query = '(max-width: 799.999px)';

    describe.each`
      matches
      ${true}
      ${false}
    `(
      'when emitting "$matches" as matches value',
      ({ matches }: { matches: boolean }) => {
        beforeEach(() => {
          fakeMediaMatcher.setMatchesQuery(query, matches);
        });

        test(`should return "${matches}" for isDisplay('phone')`, () => {
          expect(isDisplayService.isDisplay('phone')).toEqual(matches);
        });

        test(`should emit "${matches}" for isDisplay$('phone')`, async () => {
          await expect(
            firstValueFrom(isDisplayService.isDisplay$('phone'))
          ).resolves.toEqual(matches);
        });
      }
    );
  });

  describe('Given the tablet media query', () => {
    const query = '(min-width: 800px) and (max-width: 1023.999px)';

    describe.each`
      matches
      ${true}
      ${false}
    `(
      'when emitting "$matches" as matches value',
      ({ matches }: { matches: boolean }) => {
        beforeEach(() => {
          fakeMediaMatcher.setMatchesQuery(query, matches);
        });

        test(`should return "${matches}" for isDisplay('tablet')`, () => {
          expect(isDisplayService.isDisplay('tablet')).toEqual(matches);
        });

        test(`should emit "${matches}" for isDisplay$('tablet')`, async () => {
          await expect(
            firstValueFrom(isDisplayService.isDisplay$('tablet'))
          ).resolves.toEqual(matches);
        });
      }
    );
  });

  describe('Given the desktop media query', () => {
    const query = '(min-width: 1024px)';

    describe.each`
      matches
      ${true}
      ${false}
    `(
      'when emitting "$matches" as matches value',
      ({ matches }: { matches: boolean }) => {
        beforeEach(() => {
          fakeMediaMatcher.setMatchesQuery(query, matches);
        });

        test(`should return "${matches}" for isDisplay('desktop')`, () => {
          expect(isDisplayService.isDisplay('desktop')).toEqual(matches);
        });

        test(`should emit "${matches}" for isDisplay$('desktop')`, async () => {
          await expect(
            firstValueFrom(isDisplayService.isDisplay$('desktop'))
          ).resolves.toEqual(matches);
        });
      }
    );
  });
});
