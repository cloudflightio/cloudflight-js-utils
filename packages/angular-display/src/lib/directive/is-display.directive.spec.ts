/* eslint-disable max-classes-per-file */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {createSpyFromClass} from 'jest-auto-spies';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {Breakpoint} from '../model/breakpoints';
import {IsDisplayService} from '../service/is-display.service';
import {IsDisplayDirective} from './is-display.directive';

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

describe('IsDisplayDirective', () => {
    const isDisplayServiceMock = createSpyFromClass(IsDisplayService);
    const breakpoints: Record<Breakpoint, Subject<boolean>> = {
        // eslint-disable-next-line rxjs/finnish
        phone: new BehaviorSubject<boolean>(false),
        // eslint-disable-next-line rxjs/finnish
        tablet: new BehaviorSubject<boolean>(false),
        // eslint-disable-next-line rxjs/finnish
        desktop: new BehaviorSubject<boolean>(false),
    };

    const isAtLeast$ = new BehaviorSubject(false);
    const isAtMost$ = new BehaviorSubject(false);

    beforeEach(() => {
        jest.clearAllMocks();

        Object.values(breakpoints).forEach((subject$) => {
            subject$.next(false);
        });
        isAtLeast$.next(false);
        isAtMost$.next(false);

        isDisplayServiceMock.isDisplay$.mockImplementation((option: Breakpoint): Observable<boolean> => {
            return breakpoints[option]?.asObservable() ?? of(false);
        });

        isDisplayServiceMock.isDisplayAtLeast$.mockReturnValue(isAtLeast$);
        isDisplayServiceMock.isDisplayAtMost$.mockReturnValue(isAtMost$);
    });

    describe.each(Object.entries(breakpoints))('given the %s breakpoint', (rawBreakpoint: string, currentBreakpoint$) => {
        const breakpoint = rawBreakpoint as Breakpoint;

        describe('using the normal option syntax', () => {
            @Component({
                selector: 'clf-complex',
                template: ` <span>{{ content }}</span> `,
                changeDetection: ChangeDetectionStrategy.OnPush,
            })
            class ComplexComponent {
                @Input({required: true})
                public content!: string;
            }

            const content = 'The Conent';

            @Component({
                template: `
                    <div id="display-only" *clfIsDisplay="'${breakpoint}'">display-only</div>
                    <div id="display-implicit-then" *clfIsDisplay="'${breakpoint}'; else implicitNotDisplay">implicit then</div>
                    <ng-template #implicitNotDisplay>
                        <div id="display-implicit-else">implicit else</div>
                    </ng-template>
                    <div *clfIsDisplay="'${breakpoint}'; then explicitDisplay; else explicitNotDisplay"></div>
                    <ng-template #explicitDisplay>
                        <div id="display-explicit-then">explicit then</div>
                    </ng-template>
                    <ng-template #explicitNotDisplay>
                        <div id="display-explicit-else">explicit else</div>
                    </ng-template>
                    <clf-complex *clfIsDisplay="'${breakpoint}'" [content]="content"></clf-complex>
                `,
                changeDetection: ChangeDetectionStrategy.OnPush,
            })
            class NormalBreakpointComponent {
                protected readonly content = content;
            }

            let fixture: ComponentFixture<NormalBreakpointComponent>;

            beforeEach(() => {
                fixture = TestBed.configureTestingModule({
                    imports: [IsDisplayDirective],
                    declarations: [NormalBreakpointComponent, ComplexComponent],
                    providers: [{provide: IsDisplayService, useValue: isDisplayServiceMock}],
                }).createComponent(NormalBreakpointComponent);
                fixture.detectChanges();
            });

            describe('when there is no value emitted yet', () => {
                test('should not display display-only', () => {
                    const element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).toBeNull();
                });

                test('should display display-implicit-else', () => {
                    const thenElement = fixture.debugElement.query(By.css('#display-implicit-then'));
                    expect(thenElement).toBeNull();
                    const elseElement = fixture.debugElement.query(By.css('#display-implicit-else'));
                    expect(elseElement).not.toBeNull();
                });

                test('should display display-explicit-else', () => {
                    const thenElement = fixture.debugElement.query(By.css('#display-explicit-then'));
                    expect(thenElement).toBeNull();
                    const elseElement = fixture.debugElement.query(By.css('#display-explicit-else'));
                    expect(elseElement).not.toBeNull();
                });

                test('should not display the complex component', () => {
                    const complexElement = fixture.debugElement.query(By.css('clf-complex'));
                    expect(complexElement).toBeNull();
                });
            });

            describe('when emitting a value the displayed part should change', () => {
                test('should display display-only', () => {
                    currentBreakpoint$.next(false);
                    fixture.detectChanges();
                    let element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).toBeNull();

                    currentBreakpoint$.next(true);
                    fixture.detectChanges();
                    element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).not.toBeNull();
                });

                test('should not display display-implicit-else', () => {
                    currentBreakpoint$.next(false);
                    fixture.detectChanges();
                    let thenElement = fixture.debugElement.query(By.css('#display-implicit-then'));
                    expect(thenElement).toBeNull();
                    let elseElement = fixture.debugElement.query(By.css('#display-implicit-else'));
                    expect(elseElement).not.toBeNull();

                    currentBreakpoint$.next(true);
                    fixture.detectChanges();
                    thenElement = fixture.debugElement.query(By.css('#display-implicit-then'));
                    expect(thenElement).not.toBeNull();
                    elseElement = fixture.debugElement.query(By.css('#display-implicit-else'));
                    expect(elseElement).toBeNull();
                });

                test('should not display display-explicit-else', () => {
                    currentBreakpoint$.next(false);
                    fixture.detectChanges();
                    let thenElement = fixture.debugElement.query(By.css('#display-explicit-then'));
                    expect(thenElement).toBeNull();
                    let elseElement = fixture.debugElement.query(By.css('#display-explicit-else'));
                    expect(elseElement).not.toBeNull();

                    currentBreakpoint$.next(true);
                    fixture.detectChanges();
                    thenElement = fixture.debugElement.query(By.css('#display-explicit-then'));
                    expect(thenElement).not.toBeNull();
                    elseElement = fixture.debugElement.query(By.css('#display-explicit-else'));
                    expect(elseElement).toBeNull();
                });

                test('should display the complex component correctly', () => {
                    currentBreakpoint$.next(false);
                    fixture.detectChanges();
                    let complexElement = fixture.debugElement.query(By.css('clf-complex'));
                    expect(complexElement).toBeNull();

                    currentBreakpoint$.next(true);
                    fixture.detectChanges();
                    complexElement = fixture.debugElement.query(By.css('clf-complex'));
                    expect(complexElement).not.toBeNull();
                    expect(complexElement.nativeElement.textContent).toEqual(content);
                });
            });
        });

        describe('using the inverted option syntax', () => {
            @Component({
                template: ` <div id="display-only" *clfIsDisplay="'!${breakpoint}'">display-only</div> `,
                changeDetection: ChangeDetectionStrategy.OnPush,
            })
            class InvertedBreakpointComponent {}

            let fixture: ComponentFixture<InvertedBreakpointComponent>;

            beforeEach(() => {
                fixture = TestBed.configureTestingModule({
                    imports: [IsDisplayDirective],
                    declarations: [InvertedBreakpointComponent],
                    providers: [{provide: IsDisplayService, useValue: isDisplayServiceMock}],
                }).createComponent(InvertedBreakpointComponent);
                fixture.detectChanges();
            });

            describe('when there is no value emitted yet', () => {
                test('should display display-only', () => {
                    const element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).not.toBeNull();
                });
            });

            describe('when emitting a value the displayed part should change', () => {
                test('should display display-only', () => {
                    currentBreakpoint$.next(true);
                    fixture.detectChanges();
                    let element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).toBeNull();

                    currentBreakpoint$.next(false);
                    fixture.detectChanges();
                    element = fixture.debugElement.query(By.css('#display-only'));
                    expect(element).not.toBeNull();
                });
            });
        });
    });

    describe('using the less then or equal syntax with the tablet breakpoint', () => {
        @Component({
            template: ` <div id="display-only" *clfIsDisplay="'<=tablet'">display-only</div> `,
            changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class InvertedBreakpointComponent {}

        let fixture: ComponentFixture<InvertedBreakpointComponent>;

        beforeEach(() => {
            fixture = TestBed.configureTestingModule({
                imports: [IsDisplayDirective],
                declarations: [InvertedBreakpointComponent],
                providers: [{provide: IsDisplayService, useValue: isDisplayServiceMock}],
            }).createComponent(InvertedBreakpointComponent);
            fixture.detectChanges();
        });

        describe('when there is no value emitted yet', () => {
            test('should not display display-only', () => {
                const element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).toBeNull();
            });
        });

        describe('when emitting a value the displayed part should change', () => {
            test('should display display-only', () => {
                isAtMost$.next(false);
                fixture.detectChanges();
                let element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).toBeNull();

                isAtMost$.next(true);
                fixture.detectChanges();
                element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).not.toBeNull();
            });
        });
    });

    describe('using the more then or equal syntax with the tablet breakpoint', () => {
        @Component({
            template: ` <div id="display-only" *clfIsDisplay="'>=tablet'">display-only</div> `,
            changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class InvertedBreakpointComponent {}

        let fixture: ComponentFixture<InvertedBreakpointComponent>;

        beforeEach(() => {
            fixture = TestBed.configureTestingModule({
                imports: [IsDisplayDirective],
                declarations: [InvertedBreakpointComponent],
                providers: [{provide: IsDisplayService, useValue: isDisplayServiceMock}],
            }).createComponent(InvertedBreakpointComponent);
            fixture.detectChanges();
        });

        describe('when there is no value emitted yet', () => {
            test('should not display display-only', () => {
                const element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).toBeNull();
            });
        });

        describe('when emitting a value the displayed part should change', () => {
            test('should display display-only', () => {
                isAtLeast$.next(false);
                fixture.detectChanges();
                let element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).toBeNull();

                isAtLeast$.next(true);
                fixture.detectChanges();
                element = fixture.debugElement.query(By.css('#display-only'));
                expect(element).not.toBeNull();
            });
        });
    });
});
