import {isManifestVersion3} from "@adnbn/browser";

import InjectScriptV2 from "./InjectScriptV2";
import InjectScriptV3 from "./InjectScriptV3";

import {InjectScriptOptions, InjectScriptContract} from "./types";

export {type InjectScriptContract, type InjectScriptOptions};

export default (options: InjectScriptOptions): InjectScriptContract => {
    return isManifestVersion3() ? new InjectScriptV3(options) : new InjectScriptV2(options);
};
