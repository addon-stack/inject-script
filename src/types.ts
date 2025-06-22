type Awaited<T> = chrome.scripting.Awaited<T>;
type ExecutionWorld = chrome.scripting.ExecutionWorld
type InjectionResult<T> = chrome.scripting.InjectionResult<T>

export interface InjectScriptContract {
    run: <A extends any[], R extends any>(
        func: (...arg: A) => R,
        args?: A
    ) => Promise<InjectionResult<Awaited<R>>[]>;

    file: (files: string | string[]) => Promise<void>;

    options: (options: Partial<InjectScriptCommonOptions>) => this
}

export interface InjectScriptCommonOptions {
    tabId: number,
    frameId?: boolean | number | number[],
    matchAboutBlank?: boolean,
    injectImmediately?: boolean,
}

export interface InjectScriptV2Options extends InjectScriptCommonOptions {
    timeFallback?: number;
}

export interface InjectScriptV3Options extends InjectScriptCommonOptions {
    world?: ExecutionWorld;
    documentId?: string | string[];
}

export type InjectScriptOptions = InjectScriptV2Options & InjectScriptV3Options
