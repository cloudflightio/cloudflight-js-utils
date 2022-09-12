import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

/**
 * ## Usage
 * ```html
 * <div *clfTeleport="target">
 *   content
 * </div>
 * ```
 * `target` is either a HTMLElement or `undefined`. In case of undefined `document.body` will be the target.
 */
@Directive({
  selector: '[clfTeleport]',
  standalone: true,
})
export class TeleportDirective implements OnDestroy {
  @Input() public set clfTeleport(target: HTMLElement | undefined) {
    this.view?.destroy();
    this.view = this.vcRef.createEmbeddedView(this.templateRef);

    (target ?? document.body).append(...this.view.rootNodes);
  }

  private view?: EmbeddedViewRef<unknown>;

  /**
   * @internal
   */
  public constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly vcRef: ViewContainerRef
  ) {}

  /**
   * @internal
   */
  public ngOnDestroy(): void {
    this.view?.destroy();
  }
}
