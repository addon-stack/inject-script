import {isManifestVersion3} from "@adnbn/browser";

import InjectScriptV2, {InjectScriptV2Options} from "./InjectScriptV2";
import InjectScriptV3, {InjectScriptV3Options} from "./InjectScriptV3";

import {InjectScriptOptions, InjectScriptContract} from "./types";

export {type InjectScriptContract, type InjectScriptOptions};

export type InjectScriptUnionOptions = InjectScriptV2Options & InjectScriptV3Options;

export default (options: InjectScriptUnionOptions): InjectScriptContract => {
    const {timeFallback, ...optionsV3} = options;
    const {documentId, world, ...optionsV2} = options;

    return isManifestVersion3() ? new InjectScriptV3(optionsV3) : new InjectScriptV2(optionsV2);
};
