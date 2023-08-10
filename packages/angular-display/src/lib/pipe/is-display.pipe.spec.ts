import {ChangeDetectorRef} from '@angular/core';
import {createSpyFromClass, Spy} from 'jest-auto-spies';
import {Subject} from 'rxjs';
import {IsDisplayService} from '../service/is-display.service';
import {IsDisplayPipe} from './is-display.pipe';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ClfIsDisplay {
        export interface Breakpoints {
            phone: number;
            tablet: number;
            desktop: number;
        }
    }
}

describe('IsDisplayPipe', () => {
    let isDisplayServiceMock: Spy<IsDisplayService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- this is the recommended way to mock abstract classes
    const changeDetectionRefMock = createSpyFromClass<ChangeDetectorRef>(ChangeDetectorRef as any, ['markForCheck']);

    beforeEach(() => {
        jest.clearAllMocks();
        isDisplayServiceMock = createSpyFromClass(IsDisplayService);
    });

    describe('Given a IsDisplayPipe', () => {
        let pipe: IsDisplayPipe;

        beforeEach(() => {
            pipe = new IsDisplayPipe(changeDetectionRefMock, isDisplayServiceMock);
        });

        afterEach(() => {
            // make sure the pipe unsubscribes from the observable
            pipe.ngOnDestroy();
        });

        describe('When checking for the exact breakpoint', () => {
            let isDisplay$: Subject<boolean>;

            beforeEach(() => {
                isDisplay$ = isDisplayServiceMock.isDisplay$.returnSubject();
            });

            it('should initially return false if no emit happened', () => {
                const actual = pipe.transform('phone');
                expect(actual).toBe(false);
            });

            it('should return the emitted value after it emitted once', () => {
                pipe.transform('phone');
                isDisplay$.next(true);

                const actual = pipe.transform('phone');
                expect(actual).toBe(true);
            });

            it('should return the latest emitted value after it emitted multiple times', () => {
                pipe.transform('phone');
                isDisplay$.next(true);
                isDisplay$.next(true);
                isDisplay$.next(false);

                const actual = pipe.transform('phone');
                expect(actual).toBe(false);
            });
        });

        describe('When checking for the negated breakpoint', () => {
            let isDisplay$: Subject<boolean>;

            beforeEach(() => {
                isDisplay$ = isDisplayServiceMock.isDisplay$.returnSubject();
            });

            it('should initially return false if no emit happened', () => {
                const actual = pipe.transform('!phone');
                expect(actual).toBe(false);
            });

            it('should return the emitted negated value after it emitted once', () => {
                pipe.transform('!phone');
                isDisplay$.next(false);

                const actual = pipe.transform('!phone');
                expect(actual).toBe(true);
            });

            it('should return the latest emitted negated value after it emitted multiple times', () => {
                pipe.transform('!phone');
                isDisplay$.next(true);
                isDisplay$.next(true);
                isDisplay$.next(false);

                const actual = pipe.transform('!phone');
                expect(actual).toBe(true);
            });
        });

        describe('When checking for at most the breakpoint', () => {
            let atMost$: Subject<boolean>;

            beforeEach(() => {
                atMost$ = isDisplayServiceMock.isDisplayAtMost$.returnSubject();
            });

            it('should initially return false if no emit happened', () => {
                const actual = pipe.transform('<=phone');
                expect(actual).toBe(false);
            });

            it('should return the emitted value after it emitted once', () => {
                pipe.transform('<=phone');
                atMost$.next(true);

                const actual = pipe.transform('<=phone');
                expect(actual).toBe(true);
            });

            it('should return the latest emitted value after it emitted multiple times', () => {
                pipe.transform('<=phone');
                atMost$.next(true);
                atMost$.next(true);
                atMost$.next(false);

                const actual = pipe.transform('<=phone');
                expect(actual).toBe(false);
            });
        });

        describe('When checking for at least the breakpoint', () => {
            let atLeast$: Subject<boolean>;

            beforeEach(() => {
                atLeast$ = isDisplayServiceMock.isDisplayAtLeast$.returnSubject();
            });

            it('should initially return false if no emit happened', () => {
                const actual = pipe.transform('>=phone');
                expect(actual).toBe(false);
            });

            it('should return the emitted value after it emitted once', () => {
                pipe.transform('>=phone');
                atLeast$.next(true);

                const actual = pipe.transform('>=phone');
                expect(actual).toBe(true);
            });

            it('should return the latest emitted value after it emitted multiple times', () => {
                pipe.transform('>=phone');
                atLeast$.next(true);
                atLeast$.next(true);
                atLeast$.next(false);

                const actual = pipe.transform('>=phone');
                expect(actual).toBe(false);
            });
        });

        describe('When switching between different breakpoint queries', () => {
            let isDisplay$: Subject<boolean>;
            let atMost$: Subject<boolean>;
            let atLeast$: Subject<boolean>;

            beforeEach(() => {
                isDisplay$ = isDisplayServiceMock.isDisplay$.returnSubject();
                atMost$ = isDisplayServiceMock.isDisplayAtMost$.returnSubject();
                atLeast$ = isDisplayServiceMock.isDisplayAtLeast$.returnSubject();
            });

            it('should return the latest emitted value of those queries', () => {
                isDisplay$.next(true);
                atMost$.next(false);
                atLeast$.next(true);

                const first = pipe.transform('phone');
                expect(first).toBe(true);

                const second = pipe.transform('<=phone');
                expect(second).toBe(false);

                atMost$.next(true);
                atLeast$.next(false);

                const third = pipe.transform('>=phone');
                expect(third).toBe(false);
            });
        });
    });
});
