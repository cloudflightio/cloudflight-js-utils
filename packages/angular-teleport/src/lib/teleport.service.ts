import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TeleportService {
  public constructor(
    private readonly appRef: ApplicationRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly injector: Injector
  ) {}

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
