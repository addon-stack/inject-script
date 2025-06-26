import {executeScript} from "@adnbn/browser";

import AbstractInjectScript from "./AbstractInjectScript";

import {InjectScriptOptions} from "./types";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionTarget = chrome.scripting.InjectionTarget;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;

export default class extends AbstractInjectScript {
    constructor(options: InjectScriptOptions) {
        super(options);
    }

    public async run<A extends any[], R extends any>(
        func: (...args: A) => R,
        args?: A
    ): Promise<InjectionResult<Awaited<R>>[]> {
        const {world} = this._options;

        return executeScript({target: this.target, func, args, world, injectImmediately: this.injectImmediately});
    }

    public async file(fileList: string | string[]): Promise<void> {
        const {world} = this._options;
        const files = typeof fileList === "string" ? [fileList] : fileList;

        await executeScript({target: this.target, files, world, injectImmediately: this.injectImmediately});
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

    protected get injectImmediately(): boolean {
        return this._options.runAt === "document_start";
    }
}
