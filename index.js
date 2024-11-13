/// <reference path="./modules.d.ts" />
import esbuild from "esbuild"
import getStableHash from "@flinbein/json-stable-hash";
import path from "node:path";
/** @returns {import("rollup").Plugin} */
export default function rollupPluginVarhubBundle(options) {
	const pluginName = 'rollup-plugin-varhub-bundle';
	return {
		name: pluginName,
		load: {
			order: 'pre',
			/** @returns {Promise<null | {code:string, moduleSideEffects: false, meta?: Record<string, any>}>} */
			async handler(id) {
				if (id.endsWith("?varhub-bundle:integrity")) {
					const bundleId = id.substring(0, id.length - 10);
					const resolveResult = await this.resolve(bundleId);
					const moduleInfo = await this.load({...resolveResult});
					const data = moduleInfo.meta[pluginName];
					return {
						code: `export default ${JSON.stringify(data.integrity)}`,
						moduleSideEffects: false
					};
				}
				if (id.endsWith("?varhub-bundle:module")) {
					const bundleId = id.substring(0, id.length - 7);
					return {
						code: `export {module as default} from ${JSON.stringify(bundleId)}`,
						moduleSideEffects: false
					};
				}
				if (id.endsWith("?varhub-bundle")) {
					const entrypoint = id.substring(0, id.length - 14);
					const buildResult = await esbuild.build({
						target: "es2023",
						minify: true,
						format: "esm",
						external: ["varhub:*"],
						...options,
						bundle: true,
						metafile: true,
						entryPoints: [entrypoint],
						outfile: "index.js",
						write: false,
					});

					const basePath = path.dirname(buildResult.outputFiles[0].path);
					const deps = Object.keys(buildResult.metafile.inputs).map(input => {
						const match = input.match(/^[a-zA-Z-]{2,}:(.*)/);
						if (match) return match[1];
						return path.resolve(basePath, input);
					});
					await Promise.all([...new Set(deps)].map(async (dep) => {
						const resolveResult = await this.resolve(dep);
						if (resolveResult?.id) {
							this.addWatchFile(resolveResult.id);
						} else {
							this.warn(`unknown dependency ${JSON.stringify(dep)} will not be tracked.`);
						}
					}));
					const module = {
						main: "index.js",
						source: {"index.js": buildResult.outputFiles[0].text}
					}
					const integrity = getStableHash(module, "sha256", "hex");
					return {
						code: `export const module = ${JSON.stringify(module)}; export const integrity = ${JSON.stringify(integrity)}`,
						moduleSideEffects: false,
						meta: {[pluginName]: {module, integrity}}
					}
				}
				return null;
			}
		},
	}
}