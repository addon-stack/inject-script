import {isManifestVersion3} from "@adnbn/browser";

import InjectScriptV2 from "./InjectScriptV2";
import InjectScriptV3 from "./InjectScriptV3";

import {InjectScriptCommonOptions, InjectScriptContract, InjectScriptOptions} from "./types";

export {
    type InjectScriptContract,
    type InjectScriptOptions,
    type InjectScriptCommonOptions
};

export const injectScriptFactory = (options: InjectScriptOptions): InjectScriptContract => {
    const {timeFallback, ...optionsV3} = options;
    const {documentId, world, ...optionsV2} = options;

    return isManifestVersion3()
        ? new InjectScriptV3(optionsV3)
        : new InjectScriptV2(optionsV2);
};
