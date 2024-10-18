// using FFI to call libnftables
// https://manpages.debian.org/bookworm/libnftables1/libnftables.3.en.html

// this is easier than I expected

export default class Nft {
	private lib;
	private ctx: Deno.PointerValue | null;
	private enc;

	constructor(lib_path: string) {
		this.lib = Deno.dlopen(
			lib_path,
			{
				"nft_ctx_new": {
					parameters: ["u32"],
					result: "pointer",
				},
				"nft_ctx_free": {
					parameters: ["pointer"],
					result: "void",
				},
				"nft_ctx_output_set_flags": {
					parameters: ["pointer", "usize"],
					result: "void",
				},
				"nft_ctx_buffer_output": {
					parameters: ["pointer"],
					result: "isize",
				},
				"nft_ctx_buffer_error": {
					parameters: ["pointer"],
					result: "isize",
				},
				"nft_ctx_get_output_buffer": {
					parameters: ["pointer"],
					result: "pointer",
				},
				"nft_ctx_get_error_buffer": {
					parameters: ["pointer"],
					result: "pointer",
				},
				"nft_run_cmd_from_buffer": {
					parameters: ["pointer", "buffer"],
					result: "isize",
				},
			} as const,
		);

		this.ctx = this.lib.symbols.nft_ctx_new(0);
		if (this.ctx === null) {
			throw "failed to create nft ctx";
		}

		// NFT_CTX_OUTPUT_JSON
		this.lib.symbols.nft_ctx_output_set_flags(this.ctx, BigInt(1 << 4));

		let err = this.lib.symbols.nft_ctx_buffer_output(this.ctx);
		if (err !== 0n) {
			throw `failed to set nft output to buffer(${err})`;
		}

		err = this.lib.symbols.nft_ctx_buffer_error(this.ctx);
		if (err !== 0n) {
			throw `failed to set nft error to buffer(${err})`;
		}

		this.enc = new TextEncoder();
	}

	free() {
		this.lib.symbols.nft_ctx_free(this.ctx);
		this.ctx = null;
	}

	run(cmd: string): { code: number; out: string } {
		const code = Number(this.lib.symbols.nft_run_cmd_from_buffer(
			this.ctx,
			this.to_cstr(cmd),
		));
		let o;
		if (code === 0) {
			o = this.lib.symbols.nft_ctx_get_output_buffer(this.ctx);
		} else {
			o = this.lib.symbols.nft_ctx_get_error_buffer(this.ctx);
		}
		return {
			code,
			out: o === null ? "" : new Deno.UnsafePointerView(o).getCString()
		};
	}

	private to_cstr(s: string): Uint8Array {
		const s8 = this.enc.encode(s);
		const r = new Uint8Array(s8.length + 1);
		r.set(s8, 0);
		return r;
	}
}

if (import.meta.main) {
	const nft = new Nft("/lib/x86_64-linux-gnu/libnftables.so.1");
	for (const i of [0, 1, 2]) {
		const r = nft.run(`list set ip potato ips${i}`);
		console.log(`nft returns ${r.code}: ${r.out}`);
	}
	nft.free();
}
