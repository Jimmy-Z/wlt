import Nft from "./nft.ts";
import * as consts from "./consts.ts";

export default class Cgi {
	private nft: Nft;
	constructor() {
		this.nft = new Nft(consts.LIBNFT_PATH);
	}

	call(params: URLSearchParams, r_addr: string): object {
		const set = params.get("set");
		if (set !== null) {
			const log = [];
			for (const [name, _] of consts.SETS) {
				const r = this.nft.run(`list set ${consts.SET_FML} ${consts.SET_TBL} ${name}`);
				if (r.code !== 0) {
					throw new Error(`nft returns ${r.code}: ${r.out}`);
				}
				const j = JSON.parse(r.out);
				const elem = j["nftables"][1]["set"]["elem"] ?? [];
				if (set === name) { // needs to be in this set
					if (elem.indexOf(r_addr) === -1) { // but it's not
						const r = this.nft.run(`add element ${consts.SET_FML} ${consts.SET_TBL} ${name} { ${r_addr} }`);
						if (r.code !== 0) {
							throw new Error(`nft returns ${r.code}: ${r.out}`);
						}
						log.push(`added ${r_addr} to ${name}`);
					}
				} else { // don't need to be in this set
					if (elem.indexOf(r_addr) !== -1) { // but it is
						const r = this.nft.run(`delete element ${consts.SET_FML} ${consts.SET_TBL} ${name} { ${r_addr} }`);
						if (r.code !== 0) {
							throw new Error(`nft returns ${r.code}: ${r.out}`);
						}
						log.push(`removed ${r_addr} from ${name}`);
					}
				}
			}
			return {
				log,
			};
		} else {
			let nft_ver = null;
			const sets = [];
			for (const [name, comment] of consts.SETS) {
				const r = this.nft.run(`list set ${consts.SET_FML} ${consts.SET_TBL} ${name}`);
				if (r.code !== 0) {
					throw new Error(`nft returns ${r.code}: ${r.out}`);
				}
				const j = JSON.parse(r.out);
				if (nft_ver === null) {
					nft_ver = j["nftables"][0]["metainfo"]["version"];
				}
				const elem = j["nftables"][1]["set"]["elem"] ?? [];
				sets.push({
					name,
					comment,
					elem,
				});
			}
			return {
				nft_ver,
				r_addr,
				sets,
			}
		}
	}
}
