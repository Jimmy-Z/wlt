
async function call(set) {
	const resp = await (await fetch(`/cgi?set=${set}`)).json();
	const c = []
	for (const log of resp.log) {
		c.push(`<code>${log}</code><br>\n`);
	}
	document.body.insertAdjacentHTML("beforeend", c.join(""));
}

window.onload = async () => {
	const resp = await (await fetch("/cgi")).json();
	const c = [];
	c.push(`nftables <code>${resp.nft_ver}</code><br>\n`);
	c.push(`address: <code>${resp.r_addr}</code><br>\n`);
	c.push("<button onclick='call(\"none\")'><code>none</code></button><br>\n");
	c.push("<ul>\n");
	for (const set of resp.sets) {
		c.push(`<li><button onclick='call("${set.name}")'><code>${set.name}</code></button>&nbsp;${set.comment}\n<ul>\n`);
		for (const elem of set.elem) {
			if (elem === resp.r_addr) {
				c.push(`<li><code><i>${elem}</i></code></li>\n`);
			} else {
				c.push(`<li><code>${elem}</code></li>\n`);
			}
		}
		c.push("</ul></li>\n");
	}
	c.push("</ul>\n");
	document.body.insertAdjacentHTML("afterbegin", c.join(""));
}
