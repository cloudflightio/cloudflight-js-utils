import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

/**
 * Same idea as {@link TeleportDirective}, but for programmatically creating components.
 */
@Injectable({
  providedIn: 'root',
})
export class TeleportService {
  /**
   * @internal
   */
  public constructor(
    private readonly appRef: ApplicationRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector
  ) {}

  /**
   * Creates the specified component at the designated target. Change detection and clean up are taken care of.
   */
  public create<T>(
    component: Type<T>,
    target: HTMLElement = document.body,
    injector?: Injector
  ): ComponentRef<T> {
    const factory =
      this.componentFactoryResolver.resolveComponentFactory(component);

    const componentRef = factory.create(injector ?? this.injector);

    this.appRef.attachView(componentRef.hostView);
    target.append(componentRef.location.nativeElement);

    componentRef.onDestroy(() => {
      const element: HTMLElement = componentRef.location.nativeElement;
      element.remove();
    });

    return componentRef;
  }
}
