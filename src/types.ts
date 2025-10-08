type RunAt = chrome.extensionTypes.RunAt;
type Awaited<T> = chrome.scripting.Awaited<T>;
type ExecutionWorld = chrome.scripting.ExecutionWorld;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;

export interface InjectScriptContract {
    run: <A extends any[], R>(func: (...arg: A) => R, args?: A) => Promise<InjectionResult<Awaited<R>>[]>;

    file: (files: string | string[]) => Promise<void>;

    options: (options: Partial<InjectScriptOptions>) => this;
}

export interface InjectScriptOptions {
    tabId: number;
    frameId?: boolean | number | number[];
    matchAboutBlank?: boolean;

    // Options for MV2
    runAt?: RunAt;
    timeFallback?: number;

    // Options for MV3
    world?: ExecutionWorld | `${ExecutionWorld}`;
    documentId?: string | string[];
}
