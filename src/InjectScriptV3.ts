import {executeScript} from "@adnbn/browser";

import AbstractInjectScript from "./AbstractInjectScript";

import {InjectScriptOptions} from "./types";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionTarget = chrome.scripting.InjectionTarget;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;
type ExecutionWorld = chrome.scripting.ExecutionWorld;

export interface InjectScriptV3Options extends InjectScriptOptions {
    world?: ExecutionWorld;
    documentId?: string | string[];
}

export default class extends AbstractInjectScript {
    constructor(protected _options: InjectScriptV3Options) {
        super(_options);
    }

    public async run<A extends any[], R extends any>(
        func: (...args: A) => R,
        args?: A
    ): Promise<InjectionResult<Awaited<R>>[]> {
        const {world, injectImmediately} = this._options;

        return executeScript({target: this.target, func, args, world, injectImmediately});
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {world, injectImmediately} = this._options;
        const files = typeof fileList === "string" ? [fileList] : fileList;

        await executeScript({target: this.target, files, world, injectImmediately});
    }

    protected get target(): InjectionTarget {
        const {tabId} = this._options;

        return {
            tabId,
            allFrames: this.allFrames,
            frameIds: this.frameIds,
            documentIds: this.documentIds,
        };
    }

    protected get documentIds(): string[] | undefined {
        const {documentId} = this._options;

        return typeof documentId === "string" ? [documentId] : documentId;
    }
}
