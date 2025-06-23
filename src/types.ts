type Awaited<T> = chrome.scripting.Awaited<T>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;

export interface InjectScriptContract {
    run: <A extends any[], R extends any>(func: (...arg: A) => R, args?: A) => Promise<InjectionResult<Awaited<R>>[]>;

    file: (files: string | string[]) => Promise<void>;

    options: (options: Partial<InjectScriptOptions>) => this;
}

export interface InjectScriptOptions {
    tabId: number;
    frameId?: boolean | number | number[];
    matchAboutBlank?: boolean;
    injectImmediately?: boolean;
}
