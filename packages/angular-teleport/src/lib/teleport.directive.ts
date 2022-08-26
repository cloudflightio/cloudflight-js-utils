import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

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

  public constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly vcRef: ViewContainerRef
  ) {}

  public ngOnDestroy(): void {
    this.view?.destroy();
  }
}
