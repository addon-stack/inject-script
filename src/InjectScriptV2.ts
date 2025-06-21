import {nanoid} from "nanoid/non-secure";

import {Message} from "adnbn/message";

import {getAllFrames, executeScriptTab } from "@adnbn/browser";

import AbstractInjectScript  from "./AbstractInjectScript";

import {InjectScriptV2Options} from "./types";

type RunAt = chrome.extensionTypes.RunAt;
type InjectDetails = chrome.extensionTypes.InjectDetails;

type MessageSender = chrome.runtime.MessageSender;

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;

export default class extends AbstractInjectScript {
    private message = new Message();

    public constructor(protected options: InjectScriptV2Options) {
        super(options);
    }

    public async run<A extends any[], R extends any>(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]> {
        return new Promise<InjectionResult<Awaited<R>>[]>(async (resolve, reject) => {
            const {tabId} = this.options;

            const type = `inject-script-${nanoid()}`;
            const injectResults: InjectionResult<Awaited<R>>[] = [];

            let frameCount: number = 0;

            const listener = (data: { result?: any, error?: Error }, {frameId, documentId}: MessageSender) => {
                frameCount -= 1;

                const {result, error} = data;

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

            const unsubscribe = this.message.watch(type, listener);

            const timeoutId = setTimeout(() => {
                unsubscribe();
                clearTimeout(timeoutId);
                reject(new Error("Script execution timed out."));
            }, this.options.timeFallback || 4000);

            const details: InjectDetails = {
                code: this.getCode(type, func, args),
                runAt: this.runAt,
                matchAboutBlank: this.matchAboutBlank,
            };

            if (this.allFrames) {
                frameCount = (await getAllFrames(tabId) || []).length;

                await executeScriptTab(tabId, {...details, allFrames: true});
            } else if (this.frameIds) {
                frameCount = this.frameIds.length;

                await Promise.all(this.frameIds.map(frameId => executeScriptTab(tabId, {...details, frameId})));
            } else {
                await executeScriptTab(tabId, details);
            }
        });

    }

    public async file(files: string | string[]): Promise<void> {
        const {tabId} = this.options;

        const fileList = typeof files === 'string' ? [files] : files;

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
        const serializedType = JSON.stringify(type);
        const serializedFunc = JSON.stringify(func);
        const serializedArgs = JSON.stringify(args ?? []);

        return `(${codeSource})(${serializedType}, ${serializedFunc}, ${serializedArgs})`;
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
                    chrome.runtime
                        .sendMessage({type, data})
                        .catch((err) => console.error('Error send message when injection script', err));
                });
        };
    }

    protected get runAt(): RunAt {
        return this.options.injectImmediately ? "document_start" : "document_idle";
    }
}
