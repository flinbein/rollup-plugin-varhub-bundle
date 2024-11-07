declare module "*?varhub-bundle:integrity" {
	export {integrity as default} from "*?varhub-bundle"
}
declare module "*?varhub-bundle:module" {
	export {module as default} from "*?varhub-bundle"
}
declare module "*?varhub-bundle" {
	export const module: {main: "index.js", source: {"index.js": string}};
	export const integrity: string;
}
