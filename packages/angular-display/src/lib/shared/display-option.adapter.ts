import {map, Observable} from 'rxjs';
import {Breakpoint} from '../model/breakpoints';
import {IsDisplayService} from '../service/is-display.service';

/**
 * Represents all available breakpoint queries.
 *
 * Possible queries are: 'breakpoint', '!breakpoint', '<=breakpoint' and '>=breakpoint'.
 */
export type ValidOption = Breakpoint | `!${Breakpoint}` | `<=${Breakpoint}` | `>=${Breakpoint}`;

/**
 * @internal
 */
export interface OptionAdapter {
    readonly isDisplay: boolean;
    readonly isDisplay$: Observable<boolean>;
}

/**
 * @internal
 */
export function parseOption(validOption: ValidOption, service: IsDisplayService): OptionAdapter {
    // at runtime valid validOption is a string
    const rawOption = validOption as string;
    if (rawOption.startsWith('!')) {
        const option = rawOption.slice(1) as Breakpoint;
        return createInvertedOptionAdapter(option, service);
    } else if (rawOption.startsWith('<=')) {
        const option = rawOption.slice(2) as Breakpoint;
        return createAtMostOptionAdapter(option, service);
    } else if (rawOption.startsWith('>=')) {
        const option = rawOption.slice(2) as Breakpoint;
        return createAtLeastOptionAdapter(option, service);
    } else {
        const option = rawOption as Breakpoint;
        return createNormalOptionAdapter(option, service);
    }
}

function createNormalOptionAdapter(option: Breakpoint, service: IsDisplayService): OptionAdapter {
    return {
        isDisplay: service.isDisplay(option),
        isDisplay$: service.isDisplay$(option),
    };
}

function createInvertedOptionAdapter(option: Breakpoint, service: IsDisplayService): OptionAdapter {
    return {
        isDisplay: !service.isDisplay(option),
        isDisplay$: service.isDisplay$(option).pipe(map((value) => !value)),
    };
}

function createAtMostOptionAdapter(option: Breakpoint, service: IsDisplayService): OptionAdapter {
    return {
        isDisplay: service.isDisplayAtMost(option),
        isDisplay$: service.isDisplayAtMost$(option),
    };
}

function createAtLeastOptionAdapter(option: Breakpoint, service: IsDisplayService): OptionAdapter {
    return {
        isDisplay: service.isDisplayAtLeast(option),
        isDisplay$: service.isDisplayAtLeast$(option),
    };
}
