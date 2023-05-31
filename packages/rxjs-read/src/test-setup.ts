// the `symbol-observable` import must take place before rxjs otherwise the `Symbol.observable` is not set
// and rxjs will initialize its internal symbol incompatible
import 'symbol-observable';

import {TestScheduler} from 'rxjs/testing';

// set the default frameTimeFactor to 1 like it is done automatically when running inside the `run` callback
// otherwise cold observables created outside the `run` callback will have a different frame interval between emits.
TestScheduler.frameTimeFactor = 1;
