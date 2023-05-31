import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class MediaMatcher {
    public matchMedia(query: string): MediaQueryList {
        return window.matchMedia(query);
    }
}
