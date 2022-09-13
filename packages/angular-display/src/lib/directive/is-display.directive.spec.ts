/* eslint-disable max-classes-per-file */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { IsDisplayService } from '../service/is-display.service';
import { IsDisplayDirective } from './is-display.directive';
import { createSpyFromClass } from 'jest-auto-spies';

describe('IsDisplayDirective', () => {
  const isDisplayServiceMock = createSpyFromClass(IsDisplayService);
  const breakpoints: Record<string, Subject<boolean>> = {
    phone: new BehaviorSubject<boolean>(false),
    tablet: new BehaviorSubject<boolean>(false),
    desktop: new BehaviorSubject<boolean>(false),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Object.values(breakpoints).forEach((subject) => {
      subject.next(false);
    });

    isDisplayServiceMock.isDisplay$.mockImplementation(
      (option: string): Observable<boolean> => {
        return breakpoints[option]?.asObservable() ?? of(false);
      }
    );
  });

  describe.each(Object.entries(breakpoints))(
    'given a component using the %s breakpoint',
    (breakpoint, currentBreakpoint$) => {
      @Component({
        template: `
          <div id="display-only" *clfIsDisplay="'${breakpoint}'">
            display-only
          </div>
          <div
            id="display-implicit-then"
            *clfIsDisplay="'${breakpoint}'; else implicitNotDisplay"
          >
            implicit then
          </div>
          <ng-template #implicitNotDisplay>
            <div id="display-implicit-else">implicit else</div>
          </ng-template>
          <div
            *clfIsDisplay="
              '${breakpoint}';
              then explicitDisplay;
              else explicitNotDisplay
            "
          ></div>
          <ng-template #explicitDisplay>
            <div id="display-explicit-then">explicit then</div>
          </ng-template>
          <ng-template #explicitNotDisplay>
            <div id="display-explicit-else">explicit else</div>
          </ng-template>
        `,
      })
      class BreakpointComponent {}

      let fixture: ComponentFixture<BreakpointComponent>;

      beforeEach(() => {
        fixture = TestBed.configureTestingModule({
          declarations: [BreakpointComponent, IsDisplayDirective],
          providers: [
            { provide: IsDisplayService, useValue: isDisplayServiceMock },
          ],
        }).createComponent(BreakpointComponent);
        fixture.detectChanges();
      });

      describe('when there is no value emitted yet', () => {
        test('should not display display-only', () => {
          const element = fixture.debugElement.query(By.css('#display-only'));
          expect(element).toBeNull();
        });

        test('should display display-implicit-else', () => {
          const thenElement = fixture.debugElement.query(
            By.css('#display-implicit-then')
          );
          expect(thenElement).toBeNull();
          const elseElement = fixture.debugElement.query(
            By.css('#display-implicit-else')
          );
          expect(elseElement).not.toBeNull();
        });

        test('should display display-explicit-else', () => {
          const thenElement = fixture.debugElement.query(
            By.css('#display-explicit-then')
          );
          expect(thenElement).toBeNull();
          const elseElement = fixture.debugElement.query(
            By.css('#display-explicit-else')
          );
          expect(elseElement).not.toBeNull();
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
          let thenElement = fixture.debugElement.query(
            By.css('#display-implicit-then')
          );
          expect(thenElement).toBeNull();
          let elseElement = fixture.debugElement.query(
            By.css('#display-implicit-else')
          );
          expect(elseElement).not.toBeNull();

          currentBreakpoint$.next(true);
          fixture.detectChanges();
          thenElement = fixture.debugElement.query(
            By.css('#display-implicit-then')
          );
          expect(thenElement).not.toBeNull();
          elseElement = fixture.debugElement.query(
            By.css('#display-implicit-else')
          );
          expect(elseElement).toBeNull();
        });

        test('should not display display-explicit-else', () => {
          currentBreakpoint$.next(false);
          fixture.detectChanges();
          let thenElement = fixture.debugElement.query(
            By.css('#display-explicit-then')
          );
          expect(thenElement).toBeNull();
          let elseElement = fixture.debugElement.query(
            By.css('#display-explicit-else')
          );
          expect(elseElement).not.toBeNull();

          currentBreakpoint$.next(true);
          fixture.detectChanges();
          thenElement = fixture.debugElement.query(
            By.css('#display-explicit-then')
          );
          expect(thenElement).not.toBeNull();
          elseElement = fixture.debugElement.query(
            By.css('#display-explicit-else')
          );
          expect(elseElement).toBeNull();
        });
      });
    }
  );
});
