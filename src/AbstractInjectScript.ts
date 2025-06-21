import {InjectScriptCommonOptions, InjectScriptContract} from "./types";

type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export default abstract class implements InjectScriptContract {
    protected constructor(protected options: InjectScriptCommonOptions) {
    }

    public setOptions(options: Partial<InjectScriptCommonOptions>): this {
        this.options = {...this.options, ...options, tabId: options.tabId ?? this.options.tabId};

        return this;
    }

    public abstract run<A extends any[], R extends any>(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]>;

    public abstract file(files: string | string[]): Promise<void>;

    protected get frameIds(): number[] | undefined {
        const {frameId} = this.options;

        return typeof frameId === 'number' ? [frameId] : typeof frameId !== 'boolean' ? frameId : undefined;
    }

    protected get allFrames(): boolean | undefined {
        const {frameId} = this.options;

        return typeof frameId === 'boolean' ? frameId : undefined;
    }

    protected get matchAboutBlank(): boolean {
        const {matchAboutBlank} = this.options;

        return typeof matchAboutBlank === "boolean" ? matchAboutBlank : true;
    }
}
