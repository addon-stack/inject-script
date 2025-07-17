import {executeScript, getBrowserInfo} from "@adnbn/browser";

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
        return executeScript({
            target: await this.target(),
            world: this._options.world,
            injectImmediately: this.injectImmediately,
            func,
            args,
        });
    }

    public async file(fileList: string | string[]): Promise<void> {
        await executeScript({
            target: await this.target(),
            world: this._options.world,
            injectImmediately: this.injectImmediately,
            files: typeof fileList === "string" ? [fileList] : fileList,
        });
    }

    protected async target(): Promise<InjectionTarget> {
        const target = {
            tabId: this._options.tabId,
            allFrames: this.allFrames,
            frameIds: this.frameIds,
        };

        try {
            const {name} = await getBrowserInfo();

            // Firefox does not support `documentIds` in the target
            if (name === "Firefox") {
                return target;
            }
        } catch (err) {
        }

        return {...target, documentIds: this.documentIds};
    }

    protected get documentIds(): string[] | undefined {
        const {documentId} = this._options;

        return typeof documentId === "string" ? [documentId] : documentId;
    }

    protected get injectImmediately(): boolean {
        return this._options.runAt === "document_start";
    }
}
