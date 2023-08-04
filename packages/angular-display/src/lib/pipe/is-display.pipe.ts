import {ChangeDetectorRef, OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {ReplaySubject, switchMap, Unsubscribable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {IsDisplayService} from '../service/is-display.service';
import {parseOption, ValidOption} from '../shared/display-option.adapter';

/**
 * Converts the provided breakpoint-query to a boolean value depending on the current display size.
 * For the breakpoint-queries passed to this directive please consult {@link provideIsDisplay}.
 *
 * Example:
 * ```html
 * <span>
 *     {{ 'small' | clfIsDisplay }}
 * </span>
 * ```
 *
 * The value automatically updates whenever the display size changes.
 *
 * @see {@link ValidOption}
 * @see {@link provideIsDisplay}
 */
@Pipe({
    name: 'clfIsDisplay',
    standalone: true,
    pure: false,
})
export class IsDisplayPipe implements PipeTransform, OnDestroy {
    private isDisplay = false;
    private option$ = new ReplaySubject<ValidOption>(1);
    private subscription: Unsubscribable;

    public constructor(private cdr: ChangeDetectorRef, isDisplayService: IsDisplayService) {
        this.subscription = this.option$
            .pipe(
                distinctUntilChanged(),
                switchMap((option: ValidOption) => {
                    const adapter = parseOption(option, isDisplayService);
                    return adapter.isDisplay$;
                }),
            )
            .subscribe((isDisplay) => {
                this.isDisplay = isDisplay;
                this.cdr.markForCheck();
            });
    }

    public transform(value: ValidOption): boolean {
        this.option$.next(value);

        return this.isDisplay;
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
