import { get } from 'svelte/store';
import { globalOptions } from '../stores/globalOptions';
export function buildDsParams() {
    var _a, _b, _c, _d, _e, _f;
    let ds = '';
    const options = get(globalOptions);
    ds += (_b = (_a = options.nbVues) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '1';
    ds += (_d = (_c = options.flow) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '0';
    ds += options.screenBetweenSlides ? '1' : '0';
    ds += (_f = (_e = options.sound) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '0';
    ds += options.shuffle ? '1' : '0';
    ds += options.manualMode ? '1' : '0';
    ds += options.pauseAfterEachQuestion ? '1' : '0';
    ds += options.isImagesOnSides ? '1' : '0';
    return ds;
}
