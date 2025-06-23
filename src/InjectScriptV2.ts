import {nanoid} from "nanoid/non-secure";

import {executeScriptTab, getAllFrames, onMessage} from "@adnbn/browser";

import AbstractInjectScript from "./AbstractInjectScript";

import {InjectScriptOptions} from "./types";

type RunAt = chrome.extensionTypes.RunAt;
type InjectDetails = chrome.extensionTypes.InjectDetails;

type MessageSender = chrome.runtime.MessageSender;

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;

export interface InjectScriptV2Options extends InjectScriptOptions {
    timeFallback?: number;
}

export default class extends AbstractInjectScript {
    public constructor(protected _options: InjectScriptV2Options) {
        super(_options);
    }

    public async run<A extends any[], R extends any>(
        func: (...args: A) => R,
        args?: A
    ): Promise<InjectionResult<Awaited<R>>[]> {
        return new Promise<InjectionResult<Awaited<R>>[]>(async (resolve, reject) => {
            const {tabId} = this._options;

            const type = `inject-script-${nanoid()}`;
            const injectResults: InjectionResult<Awaited<R>>[] = [];

            let frameCount: number = 0;

            const listener = (message: any, sender: MessageSender) => {
                if (message?.type !== type) return;

                const {result, error} = message?.data;
                const {frameId, documentId} = sender;

                frameCount -= 1;

                if (frameId == null || documentId == null) {
                    throw new Error("frameId or documentId is missing in sender");
                }

                if (error) {
                    console.error(`Error in injection listener with frameId = ${frameId}`, error);
                }

                frameId === 0
                    ? injectResults.unshift({frameId, documentId, result})
                    : injectResults.push({frameId, documentId, result});

                if (frameCount === 0) {
                    unsubscribe();
                    clearTimeout(timeoutId);
                    resolve(injectResults);
                }
            };

            const unsubscribe = onMessage(listener);

            const timeoutId = setTimeout(() => {
                unsubscribe();
                clearTimeout(timeoutId);
                reject(new Error("Script execution timed out."));
            }, this._options.timeFallback || 4000);

            const details: InjectDetails = {
                code: this.getCode(type, func, args),
                runAt: this.runAt,
                matchAboutBlank: this.matchAboutBlank,
            };

            if (this.allFrames) {
                frameCount = ((await getAllFrames(tabId)) || []).length;

                await executeScriptTab(tabId, {...details, allFrames: true});
            } else if (this.frameIds) {
                frameCount = this.frameIds.length;

                await Promise.all(this.frameIds.map(frameId => executeScriptTab(tabId, {...details, frameId})));
            } else {
                frameCount = 1;

                await executeScriptTab(tabId, details);
            }
        });
    }

    public async file(files: string | string[]): Promise<void> {
        const {tabId} = this._options;

        const fileList = typeof files === "string" ? [files] : files;

        const injectTasks: Promise<any>[] = [];

        for (const file of fileList) {
            const details: InjectDetails = {
                file,
                runAt: this.runAt,
                matchAboutBlank: this.matchAboutBlank,
            };

            if (this.allFrames) {
                injectTasks.push(executeScriptTab(tabId, {...details, allFrames: true}));
            } else if (this.frameIds) {
                injectTasks.push(...this.frameIds.map(frameId => executeScriptTab(tabId, {...details, frameId})));
            } else {
                injectTasks.push(executeScriptTab(tabId, details));
            }
        }

        await Promise.all(injectTasks);
    }

    protected getCode(type: string, func: Function, args?: any[]): string {
        const codeSource = this.generateCode().toString();
        const funcSource = func.toString();
        const serializedType = JSON.stringify(type);
        const serializedArgs = JSON.stringify(args ?? []);

        return `(${codeSource})(${serializedType}, ${funcSource}, ${serializedArgs})`;
    }

    protected generateCode(): (type: string, func: Function, args: any[]) => void {
        return function (type: string, func: Function, args: any[]): void {
            const data: Record<string, unknown> = {};

            Promise.resolve()
                .then(() => func(...args))
                .then(result => {
                    data.result = result;
                })
                .catch(e => {
                    data.error = {
                        message: e?.message,
                        name: e?.name,
                        stack: e?.stack,
                    };
                })
                .finally(() => {
                    chrome.runtime.sendMessage({type, data});
                });
        };
    }

    protected get runAt(): RunAt {
        return this._options.injectImmediately ? "document_start" : "document_idle";
    }
}
