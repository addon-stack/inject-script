import {executeScript} from "@adnbn/browser";

import AbstractInjectScript from "./AbstractInjectScript";

import {InjectScriptV3Options} from "./types";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionTarget = chrome.scripting.InjectionTarget
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export default class extends AbstractInjectScript {
    constructor(protected options: InjectScriptV3Options) {
        super(options);
    }

    public async run<A extends any[], R extends any>(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]> {
        const {world, injectImmediately} = this.options;

        return executeScript({target: this.target, func, args, world, injectImmediately});
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {world, injectImmediately} = this.options;
        const files = typeof fileList === 'string' ? [fileList] : fileList;

        await executeScript({target: this.target, files, world, injectImmediately});
    }

    protected get target(): InjectionTarget {
        const {tabId} = this.options;

        return {
            tabId,
            allFrames: this.allFrames,
            frameIds: this.frameIds,
            documentIds: this.documentIds,
        };
    }

    protected get documentIds(): string[] | undefined {
        const {documentId} = this.options;

        return typeof documentId === 'string' ? [documentId] : documentId;
    }
}
