import {isManifestVersion3} from "@addon-core/browser";
import InjectScriptV2 from "./InjectScriptV2";
import InjectScriptV3 from "./InjectScriptV3";
import type {InjectScriptContract, InjectScriptOptions} from "./types";

export type {InjectScriptContract, InjectScriptOptions};

export default (options: InjectScriptOptions): InjectScriptContract => {
    return isManifestVersion3() ? new InjectScriptV3(options) : new InjectScriptV2(options);
};
