# Install
```shell
npm install github:flinbein/rollup-plugin-varhub-bundl
```

# Description

The plugin is used to compile typescript code for a varhub VM and calculate the integrity.

# Configuration
<table>
<tr>
<td>

**Vite**
</td>
<td>

`vite.config.ts`
```typescript
import type { UserConfig } from 'vite';
import varhubBundlePlugin from "@flinbein/rollup-plugin-varhub-bundle";

export default {
  plugins: [varhubBundlePlugin()]
} satisfies UserConfig
```

</td>
</tr>
<tr>
<td>

**Rollup**
</td>
<td>

`rollup.config.js`
```javascript
import varhubBundlePlugin from "@flinbein/rollup-plugin-varhub-bundle";

export default {
  input: 'main.js',
  output: [{
    file: 'bundle.min.js',
    format: 'es',
    plugins: [varhubBundlePlugin()]
  }]
};
```
</td>
</tr>
</table>

You can pass additional options to plugin: `varhubBundlePlugin(options)`. See [ESBuild options](https://esbuild.github.io/api/#general-options)

# Usage

## varhub-bundle

`import "${entrypoint}?varhub-bundle"`

returns object with props: `module`, `integrity`.
It can be used to create room.

```javascript
const {module, integrity} = await import("./someModule.ts?varhub-bundle");
```
It is strongly recommended to use as dynamic import.

## varhub-bundle:integrity

import `"${entrypoint}?varhub-bundle:integrity"`

returns string
```javascript
import integrity from "./someModule.ts?varhub-bundle";
```

## varhub-bundle:module

import `"${entrypoint}?varhub-bundle:module"`

returns module object with props: `main`, `source`
```javascript
import module from "./someModule.ts?varhub-bundle:module";
```

# Project example
`index.ts`
```typescript
import { Varhub } from "@flinbein/varhub-web-client";
// DO NOT USE import "./roomLogic.ts" directly!
import integrity from "./roomLogic.ts?varhub-bundle:integrity";
// integrity: string

const hub = new Varhub("https://example.com/varhub/");

async function createRoom(hub: Varhub){
  const roomConfig = await import("./roomLogic.ts?varhub-bundle");
  // roomConfig: {module: object, integrity: string}
  return hub.createRoom("ivm", {...roomConfig});
}

async function start(){
  const room = await createRoom(hub);
  const client = hub.join(room.id, { integrity });
  client.on("message", console.log);
  await client;
  client.send("hello");
}
start();

```
---
`roomLogic.ts`
```typescript
import room from "varhub:room";

room.on("connectionMessage", (con, ...args) => {
  room.broadcast(...args);
});
```