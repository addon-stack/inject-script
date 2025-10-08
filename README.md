# @addon-core/inject-script

[![npm version](https://img.shields.io/npm/v/%40addon-core%2Finject-script.svg?logo=npm)](https://www.npmjs.com/package/@addon-core/inject-script)
[![npm downloads](https://img.shields.io/npm/dm/%40addon-core%2Finject-script.svg)](https://www.npmjs.com/package/@addon-core/inject-script)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![CI](https://github.com/addon-stack/inject-script/actions/workflows/ci.yml/badge.svg)](https://github.com/addon-stack/inject-script/actions/workflows/ci.yml)

A lightweight, TypeScript-ready library for injecting JavaScript functions and external script files into browser extension pages. It automatically detects Manifest V2/V3 and uses the appropriate API implementation.

## Installation

### npm:

```bash
npm install @addon-core/inject-script
```

### pnpm:

```bash
pnpm add @addon-core/inject-script
```

### yarn:

```bash
yarn add @addon-core/inject-script
```

## Quick Start

```ts
import injectScript, { type InjectScriptOptions } from "@addon-core/inject-script";

// Initialize an injector for a specific tab
const injector = injectScript({
  tabId: 123,
  frameId: false,          // top frame only
  matchAboutBlank: true,   // include about:blank and similar pages
  runAt: "document_idle",  // injection timing (MV2)
  // timeFallback: 5000,   // (MV2) default timeout is 4000 ms
  // world: 'ISOLATED',    // (MV3) execution world
  // documentId: 'abc123', // (MV3) target by documentId
} satisfies InjectScriptOptions);

// Execute a function in the page context (for all target frames)
const results = await injector.run(
  (msg: string) => {
    console.log(msg);
    return `Echo: ${msg}`;
  },
  ["Hello from the extension!"]
);

// Inject one or more external files
await injector.file("scripts/content.js");
await injector.file(["scripts/lib.js", "scripts/util.js"]);
```

## Features

- Unified API for Manifest V2 and V3 (version detection via `@addon-core/browser`).
- Inject functions (`run`) and files (`file`).
- Precise targeting: top frame, specific `frameId[]`, all frames, or (MV3) `documentId[]`.
- `world` support (MV3): `MAIN`/`ISOLATED`; instant injection when `runAt: 'document_start'`.
- Strongly-typed results: returns an array of `InjectionResult<Awaited<R>>` (one per frame).
- Update options on the fly with `options()`.

## API

### `injectScript(options: InjectScriptOptions): InjectScriptContract`

Creates and returns a new script injector. The implementation is chosen internally based on your manifest (MV2/MV3).

#### Contract

```ts
interface InjectScriptContract {
  run<A extends any[], R>(
    func: (...args: A) => R,
    args?: A
  ): Promise<chrome.scripting.InjectionResult<chrome.scripting.Awaited<R>>[]>;

  file(files: string | string[]): Promise<void>;

  options(options: Partial<InjectScriptOptions>): this;
}
```

#### Options

```ts
interface InjectScriptOptions {
  tabId: number;
  frameId?: boolean | number | number[];
  matchAboutBlank?: boolean;   // defaults to true (MV2/MV3)

  // MV2
  runAt?: chrome.extensionTypes.RunAt; // 'document_start' | 'document_end' | 'document_idle'
  timeFallback?: number;               // timeout in ms, default 4000

  // MV3
  world?: chrome.scripting.ExecutionWorld | `${chrome.scripting.ExecutionWorld}`; // 'MAIN' | 'ISOLATED'
  documentId?: string | string[];      // Firefox does not support documentIds in target
}
```

- `frameId`: `true` — all frames; a number or array — specific `frameId`s; `false` or undefined — top frame only.
- `matchAboutBlank`: if omitted, the library enables it by default (`true`).
- `runAt`: Chrome default is `document_idle` (when not specified).
- `timeFallback` (MV2): if results do not arrive in time, the promise will be rejected with an error.
- `world` (MV3): sets the execution world. When `runAt: 'document_start'`, `injectImmediately` is enabled.
- `documentId` (MV3): target specific documents. Firefox does not support `documentIds`; the library gracefully avoids using them there.

## Examples

Inject into specific frames:

```ts
const injector = injectScript({ tabId: 123, frameId: [0, 2] });
const results = await injector.run(() => window.location.href);
console.log(results.map(r => ({ frameId: r.frameId, url: r.result })));
```

All frames:

```ts
await injectScript({ tabId: 123, frameId: true }).file(["a.js", "b.js"]);
```

MV3: target by documentId and choose execution world:

```ts
await injectScript({
  tabId: 123,
  documentId: ["doc-1", "doc-2"],
  world: "MAIN",
}).run(() => ({ ready: document.readyState }));
```

Update options on the fly:

```ts
const inj = injectScript({ tabId: 123, frameId: false });
await inj.options({ frameId: true }).file("content.js");
```

## MV2/MV3 Compatibility

- MV2: the library serializes your function and arguments, executes the code in target frames, and returns results via `chrome.runtime.sendMessage`.
  - If your function throws, the result for that frame will be `undefined`, and the error will be logged in the page DevTools console.
  - Timeout is controlled by the `timeFallback` option (default 4000 ms).
  - Result order: the top frame (`frameId = 0`) is the first element in the array.
- MV3: uses `chrome.scripting.executeScript` with a properly constructed `target` (`tabId`, `frameIds`/`allFrames`, or `documentIds` when available) and `world`/`injectImmediately` options.
  - Firefox does not support `documentIds` — the library will automatically avoid using them.

## Recipes

- Inject as early as possible:
  - Set `runAt: 'document_start'` (MV2); in MV3 this enables `injectImmediately: true`.
- Inject into an isolated world (MV3):
  - `world: 'ISOLATED'` — your code won’t conflict with the page script.
- Performance:
  - Group files in a single `file([..])` call when possible to reduce overhead.
- Safety:
  - Functions passed to `run` should be self-contained: rely only on what’s available in the page context. In MV2 they are string-serialized.

## Troubleshooting

- Timeout error (MV2): increase `timeFallback`.
- `undefined` result (MV2): check the page console — the function may have thrown.
- Nothing happens:
  - Ensure your extension has permissions for the target tab/frame(s).
  - Verify `tabId`, `frameId`/`documentId`, and the `runAt` timing.
- Conflicts with page code (MV3): use `world: 'ISOLATED'`.

