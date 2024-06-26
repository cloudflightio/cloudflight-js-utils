import {Directive, EmbeddedViewRef, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {Breakpoint} from '../model/breakpoints';
import {IsDisplayService} from '../service/is-display.service';
import {parseOption, ValidOption} from '../shared/display-option.adapter';

/**
 * Adds and removes the element depending on the current breakpoint.
 * For the breakpoint-queries passed to this directive please consult {@link provideIsDisplay}.
 *
 * Example 1
 * ```html
 * <div *clfIsDisplay="'small'">
 *   small
 * </div>
 * ```
 *
 * Example 2
 * ```html
 * <div *clfIsDisplay="'!small'">
 *   not small
 * </div>
 * ```
 *
 * Example 3
 * ```html
 * <div *clfIsDisplay="'>=small'">
 *   not small
 * </div>
 * ```
 *
 * Example 4
 * ```html
 * <div *clfIsDisplay="'<=small'">
 *   not small
 * </div>
 * ```
 *
 * Example 5
 * ```html
 * <div *clfIsDisplay="'small'; else implicitNotSmall">small</div>
 *
 * <ng-template #implicitNotSmall>
 *   <div>not small</div>
 * </ng-template>
 * ```
 *
 * Example 6
 * ```html
 * <ng-container *clfIsDisplay="'small'; then explicitSmall; else explicitNotSmall"></ng-container>
 *
 * <ng-template #explicitSmall>
 *   <div>small</div>
 * </ng-template>
 *
 * <ng-template #explicitNotSmall>
 *   <div>not small</div>
 * </ng-template>
 * ```
 *
 * @see {@link ValidOption}
 * @see {@link provideIsDisplay}
 */
@Directive({
    selector: 'ng-template[clfIsDisplay] , ng-template[clfIsNotDisplay]',
    standalone: true,
})
export class IsDisplayDirective implements OnDestroy {
    private isDisplaySub?: Subscription;

    private readonly context = {
        $implicit: false,
    };
    private thenTemplateRef: TemplateRef<IsDisplayContext> | null = null;
    private elseTemplateRef: TemplateRef<IsDisplayContext> | null = null;
    private thenViewRef: EmbeddedViewRef<IsDisplayContext> | null = null;
    private elseViewRef: EmbeddedViewRef<IsDisplayContext> | null = null;

    /**
     * @internal
     */
    public constructor(
        private readonly _viewContainer: ViewContainerRef,
        templateRef: TemplateRef<IsDisplayContext>,
        private readonly isDisplayService: IsDisplayService,
    ) {
        this.thenTemplateRef = templateRef;
    }

    /**
     * Asserts the correct type of the context for the template that `IsDisplay` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `IsDisplay` structural directive renders its template with a specific context type.
     * @internal
     */
    public static ngTemplateContextGuard(dir: IsDisplayDirective, ctx: unknown): ctx is IsDisplayContext {
        return true;
    }

    /**
     * @internal
     */
    public ngOnDestroy(): void {
        this.isDisplaySub?.unsubscribe();
    }

    /**
     * The breakpoint-query to evaluate as the condition for showing a template.
     *
     * @see {@link ValidOption}
     */
    @Input()
    public set clfIsDisplay(option: ValidOption) {
        this._init(option);
    }

    /**
     * The Breakpoint to evaluate as the condition for not showing a template.
     *
     * @deprecated Use the new syntax of '!<option>' instead
     */
    @Input()
    public set clfIsNotDisplay(option: Breakpoint) {
        // in normal use ValidOption will be a template-string but here ts thinks it is never, because Breakpoints does not have any keys
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this._init(`!${String(option)}` as ValidOption);
    }

    private _init(option: ValidOption): void {
        this.isDisplaySub?.unsubscribe();
        const adapter = parseOption(option, this.isDisplayService);

        this.context.$implicit = adapter.isDisplay;
        this._updateView();

        this.isDisplaySub = adapter.isDisplay$.subscribe((isCorrectDisplay) => {
            this.context.$implicit = isCorrectDisplay;
            this._updateView();
        });
    }

    /**
     * A template to show if the display size is above or equal to the breakpoint.
     * @internal
     */
    @Input()
    public set clfIsDisplayThen(templateRef: TemplateRef<IsDisplayContext> | null) {
        assertTemplate('clfIsDisplayThen', templateRef);
        this.thenTemplateRef = templateRef;
        this.thenViewRef = null; // clear previous view if any.
        this._updateView();
    }

    /**
     * @internal
     *
     * @deprecated Use the new syntax of '!<option>' instead
     */
    @Input()
    public set clfIsNotDisplayThen(templateRef: TemplateRef<IsDisplayContext> | null) {
        this.clfIsDisplayThen = templateRef;
    }

    /**
     * A template to show if the display size is below the breakpoint.
     * @internal
     */
    @Input()
    public set clfIsDisplayElse(templateRef: TemplateRef<IsDisplayContext> | null) {
        assertTemplate('clfIsDisplayElse', templateRef);
        this.elseTemplateRef = templateRef;
        this.elseViewRef = null; // clear previous view if any.
        this._updateView();
    }

    /**
     * @internal
     *
     * @deprecated Use the new syntax of '!<option>' instead
     */
    @Input()
    public set clfIsNotDisplayElse(templateRef: TemplateRef<IsDisplayContext> | null) {
        this.clfIsDisplayElse = templateRef;
    }

    private _updateView(): void {
        if (this.context.$implicit) {
            if (this.thenViewRef == null) {
                this._viewContainer.clear();
                this.elseViewRef = null;
                if (this.thenTemplateRef != null) {
                    this.thenViewRef = this._viewContainer.createEmbeddedView(this.thenTemplateRef, this.context);
                    this.thenViewRef.markForCheck();
                }
            }
        } else if (this.elseViewRef == null) {
            this._viewContainer.clear();
            this.thenViewRef = null;
            if (this.elseTemplateRef != null) {
                this.elseViewRef = this._viewContainer.createEmbeddedView(this.elseTemplateRef, this.context);
                this.elseViewRef.markForCheck();
            }
        }
    }
}

interface IsDisplayContext {
    $implicit: boolean;
}

function assertTemplate(property: string, templateRef: TemplateRef<IsDisplayContext> | null): void {
    const isTemplateRefOrNull = templateRef == null || templateRef.createEmbeddedView != null;
    if (!isTemplateRefOrNull) {
        throw new Error(`${property} must be a TemplateRef, but received invalid template ref.`);
    }
}
