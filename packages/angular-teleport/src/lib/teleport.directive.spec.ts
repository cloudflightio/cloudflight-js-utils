import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TeleportDirective} from './teleport.directive';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
    selector: 'clf-test-component',
    imports: [TeleportDirective],
    template: `
        <ng-container *ngIf="testCase === 1">
            <div id="target1" #target1></div>
            <div *clfTeleport="target1"></div>
        </ng-container>
        <ng-container *ngIf="testCase === 2">
            <div #target1></div>
            <div #target2></div>
            <div *clfTeleport="shouldUseTarget2 ? target2 : target1" #source></div>
        </ng-container>
    `,
})
class TestComponent {
    @Input() public testCase!: 1 | 2;
    @Input() public shouldUseTarget2 = false;

    @ViewChild('target1')
    public target1?: ElementRef<HTMLElement>;

    @ViewChild('target2')
    public target2?: ElementRef<HTMLElement>;

    @ViewChild('source')
    public source?: ElementRef<HTMLElement>;
}

describe('TeleportDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(() => {
        fixture = TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [TeleportDirective],
        }).createComponent(TestComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    test('given target when teleporting then target has source as child', () => {
        component.testCase = 1;

        fixture.detectChanges();

        expect(component.target1?.nativeElement.childElementCount).toEqual(1);
    });

    it('given target changed when teleporting then changing target works', () => {
        component.testCase = 2;

        fixture.detectChanges();

        expect(component.target1?.nativeElement.childElementCount).toEqual(1);
        expect(component.target2?.nativeElement.childElementCount).toEqual(0);

        component.shouldUseTarget2 = true;

        fixture.detectChanges();

        expect(component.target1?.nativeElement.childElementCount).toEqual(0);
        expect(component.target2?.nativeElement.childElementCount).toEqual(1);
    });
});
