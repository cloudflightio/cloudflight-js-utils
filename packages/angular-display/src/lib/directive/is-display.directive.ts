/* eslint-disable max-classes-per-file */
import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { IsDisplayService } from '../service/is-display.service';

/**
 * For the string values passed to this directive please consult {@link DisplayModule}.
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
 * <div *clfIsNotDisplay="'small'">
 *   not small
 * </div>
 * ```
 *
 * Example 3
 * ```html
 * <div *clfIsDisplay="'small'; else implicitNotSmall">small</div>
 *
 * <ng-template #implicitNotSmall>
 *   <div>not small</div>
 * </ng-template>
 * ```
 *
 * Example 4
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
 */
@Directive({
  selector: '[clfIsDisplay] , [clfIsNotDisplay]',
})
export class IsDisplayDirective implements OnDestroy {
  private isDisplaySub?: Subscription;
  private invert = false;

  private readonly context = new IsDisplayContext();
  private thenTemplateRef: TemplateRef<IsDisplayContext> | null = null;
  private elseTemplateRef: TemplateRef<IsDisplayContext> | null = null;
  private thenViewRef: EmbeddedViewRef<IsDisplayContext> | null = null;
  private elseViewRef: EmbeddedViewRef<IsDisplayContext> | null = null;

  /**
   * Asserts the correct type of the context for the template that `IsDisplay` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `IsDisplay` structural directive renders its template with a specific context type.
   * @internal
   */
  public static ngTemplateContextGuard(
    dir: IsDisplayDirective,
    ctx: unknown
  ): ctx is IsDisplayContext {
    return true;
  }

  /**
   * @internal
   */
  public constructor(
    private readonly _viewContainer: ViewContainerRef,
    templateRef: TemplateRef<IsDisplayContext>,
    private readonly isDisplayService: IsDisplayService
  ) {
    this.thenTemplateRef = templateRef;
  }

  /**
   * @internal
   */
  public ngOnDestroy(): void {
    this.isDisplaySub?.unsubscribe();
  }

  /**
   * The Breakpoint to evaluate as the condition for showing a template.
   */
  @Input()
  public set clfIsDisplay(option: string) {
    this.init(option, false);
  }

  /**
   * The Breakpoint to evaluate as the condition for not showing a template.
   */
  @Input()
  public set clfIsNotDisplay(option: string) {
    this.init(option, true);
  }

  private init(option: string, invert: boolean): void {
    this.invert = invert;
    this.context.isDisplay = option;
    this.context.$implicit =
      this.invert !== this.isDisplayService.isDisplay(option);
    this._updateView();

    this.isDisplaySub?.unsubscribe();
    this.isDisplaySub = this.isDisplayService
      .isDisplay$(option)
      .subscribe((isCorrectDisplay) => {
        this.context.$implicit = this.invert !== isCorrectDisplay;
        this._updateView();
      });
  }

  /**
   * A template to show if the display size is above or equal to the breakpoint.
   * @internal
   */
  @Input()
  public set clfIsDisplayThen(
    templateRef: TemplateRef<IsDisplayContext> | null
  ) {
    assertTemplate('clfIsDisplayThen', templateRef);
    this.thenTemplateRef = templateRef;
    this.thenViewRef = null; // clear previous view if any.
    this._updateView();
  }

  /**
   * @internal
   */
  @Input()
  public set clfIsNotDisplayThen(
    templateRef: TemplateRef<IsDisplayContext> | null
  ) {
    this.clfIsDisplayThen = templateRef;
  }

  /**
   * A template to show if the display size is below the breakpoint.
   * @internal
   */
  @Input()
  public set clfIsDisplayElse(
    templateRef: TemplateRef<IsDisplayContext> | null
  ) {
    assertTemplate('clfIsDisplayElse', templateRef);
    this.elseTemplateRef = templateRef;
    this.elseViewRef = null; // clear previous view if any.
    this._updateView();
  }

  /**
   * @internal
   */
  @Input()
  public set clfIsNotDisplayElse(
    templateRef: TemplateRef<IsDisplayContext> | null
  ) {
    this.clfIsDisplayElse = templateRef;
  }

  private _updateView(): void {
    if (this.context.$implicit === true) {
      if (this.thenViewRef == null) {
        this._viewContainer.clear();
        this.elseViewRef = null;
        if (this.thenTemplateRef != null) {
          this.thenViewRef = this._viewContainer.createEmbeddedView(
            this.thenTemplateRef,
            this.context
          );
        }
      }
    } else {
      if (this.elseViewRef == null) {
        this._viewContainer.clear();
        this.thenViewRef = null;
        if (this.elseTemplateRef != null) {
          this.elseViewRef = this._viewContainer.createEmbeddedView(
            this.elseTemplateRef,
            this.context
          );
        }
      }
    }
  }
}

class IsDisplayContext {
  public $implicit: boolean | undefined;
  public isDisplay: string | undefined;
}

function assertTemplate(
  property: string,
  templateRef: TemplateRef<IsDisplayContext> | null
): void {
  const isTemplateRefOrNull =
    templateRef == null || templateRef.createEmbeddedView != null;
  if (!isTemplateRefOrNull) {
    throw new Error(
      `${property} must be a TemplateRef, but received '${templateRef}'.`
    );
  }
}
