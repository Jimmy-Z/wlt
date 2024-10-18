interface Cgi {
	call(params: URLSearchParams, r_addr: string): object;
}
export default class PicoHTTPD {
	private map;
	private cgi_path;
	private cgi;
	constructor(map: [string, [string, string]][], cgi_path: string, cgi: Cgi) {
		this.map = new Map(map);
		this.cgi_path = cgi_path;
		this.cgi = cgi;
	}

	async handle(req: Request, info: Deno.ServeHandlerInfo): Promise<Response> {
		const url = new URL(req.url);
		const r_addr = info.remoteAddr as Deno.NetAddr;
		console.log(`${r_addr.hostname}:${r_addr.port} ${req.method} ${url.pathname} ${req.headers.get("user-agent")}`);

		if (url.pathname === this.cgi_path) {
			return new Response(JSON.stringify(this.cgi.call(url.searchParams, r_addr.hostname)), { headers: { "content-type": "application/json" } });
		}

		const res = this.map.get(url.pathname);
		if (res === undefined) {
			return new Response("you're (not) welcome", { status: 404 });
		}
		const [path, type] = res;
		// to do: cache
		return new Response(await Deno.readFile(path), { headers: { "content-type": type } });
	}
}
