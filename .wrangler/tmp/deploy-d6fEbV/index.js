//#endregion
//#region \0virtual:cloudflare/worker-entry
var worker_entry_default = { fetch() {
	return new Response(`Running in ${navigator.userAgent}!`);
} };
//#endregion
export { worker_entry_default as default };
