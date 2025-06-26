# @adnbn/inject-script

[![npm version](https://img.shields.io/npm/v/@adnbn/inject-script.svg)](https://www.npmjs.com/package/@adnbn/inject-script)
[![npm downloads](https://img.shields.io/npm/dm/@adnbn/inject-script.svg)](https://www.npmjs.com/package/@adnbn/inject-script)

A lightweight, TypeScript-ready library for injecting JavaScript functions or external script files into browser extension pages.
Automatically detects Chrome Extension Manifest V2 and V3 and delegates to the appropriate API.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Executing Functions](#executing-functions)
    - [Injecting Script Files](#injecting-script-files)
    - [Updating Options](#updating-options)
- [API](#api)
- [Options](#options)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

Using npm:

```bash
npm install @adnbn/inject-script
```

Using Yarn:

```bash
yarn add @adnbn/inject-script
```

## Usage

```ts
import injectScript, {InjectScriptOptions} from "@adnbn/inject-script";

// Initialize an injector for a specific tab (Manifest V2 or V3)
const injector = injectScript({
    tabId: 123,
    frameId: false, // inject into the top frame only
    matchAboutBlank: true, // include about:blank frames
    runAt: "document_idle", // inject at `document_idle`
    // V2 only: timeFallback: 5000,   // ms before timing out (default: 4000)
    // V3 only: world: 'ISOLATED', documentId: 'abc123'
});

// Execute a function in the page context
await injector.run(
    (msg: string) => {
        console.log(msg);
        return "Done";
    },
    ["Hello from extension!"]
);

// Inject one or more external script files
await injector.file("scripts/content.js");
await injector.file(["scripts/lib.js", "scripts/util.js"]);
```

### Executing Functions

Use the `run(func: (...args: any[]) => any, args?: any[])` method to inject and execute a function. Returns an array of results (one per frame).

### Injecting Script Files

Use the `file(files: string | string[])` method to inject external script file(s).

### Updating Options

Use the `options(opts: Partial<InjectScriptOptions>)` method to merge or override injection options on an existing injector instance.

## API

### `injectScript(options: InjectScriptOptions): InjectScriptContract`

Creates and returns a new script injector. Detects your manifest version via `@adnbn/browser` and delegates to the appropriate implementation.

#### `InjectScriptContract`

- `run(func: (...args: A) => R, args?: A): Promise<InjectionResult<Awaited<R>>[]>`
- `file(files: string | string[]): Promise<void>`
- `options(opts: Partial<InjectScriptOptions>): this`

## Options

| Option            | Type                                                    | Description                                                                                                  |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tabId`           | `number` (required)                                     | Target browser tab ID.                                                                                       |
| `frameId`         | `boolean \| number \| number[]`                         | `true` for all frames, number or list for specific frame IDs.                                                |
| `matchAboutBlank` | `boolean`                                               | Include `about:blank` and similar frames (V2 and V3). Default: `true`.                                       |
| `runAt`           | `'document_start' \| 'document_end' \| 'document_idle'` | Script injection timing. Use `document_start`, `document_end`, or `document_idle`. Default: `document_idle`. |
| `timeFallback`    | `number`                                                | (V2 only) ms before timing out. Default: `4000`.                                                             |
| `world`           | `'MAIN' \| 'ISOLATED'`                                  | (V3 only) Execution world for script injection.                                                              |
| `documentId`      | `string \| string[]`                                    | (V3 only) Document IDs for injection target.                                                                 |

## Examples

```ts
import injectScript from "@adnbn/inject-script";

const injector = injectScript({
    tabId: 123,
    frameId: [0, 1],
    runAt: "document_start",
    world: "MAIN",
    documentId: ["doc1", "doc2"],
});

// Execute code and handle results
const results = await injector.run(() => location.href);
console.log(results);

// Inject scripts
await injector.file(["content.js", "helper.js"]);
```

## Development

Build files

```bash
npm run build
```

Watch mode

```bash
npm run build:watch
```

Code formatting

```bash
npm run format
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

MIT © Addon Bone
