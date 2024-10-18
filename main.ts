import Cgi from "./cgi.ts";
import PicoHTTPD from "./picohttpd.ts";

if (import.meta.main) {
	const port = Deno.args.length > 0 ? parseInt(Deno.args[0]) : 8080;
	const cgi = new Cgi;
	const httpd = new PicoHTTPD([
		["/", ["www/index.html", "text/html"]],
		["/script.js", ["www/script.js", "application/javascript"]],
	], "/cgi", cgi);
	Deno.serve({ hostname: "0.0.0.0", port }, async (req, info) => {
		return await httpd.handle(req, info);
	});
}
