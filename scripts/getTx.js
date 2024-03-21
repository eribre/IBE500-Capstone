/* eslint-disable global-require */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
process.env.NETWORK = "testnet";

async function getTx(id) {
	const txId = id;

	const WhatsApi = require("whatsonchain/index");

	console.log("Executing on the", process.env.NETWORK);

	// eslint-disable-next-line func-names
	async function accessChain(param) {
		console.log("Contacting WhatsOnChain...");
		const woc = new WhatsApi("testnet");
		try {
			return await woc.txHash(param);
			// let stat = await woc.status();
			// let tx = await woc.txHash("fac4a416140760fa851a24abc857880209fded46e04a3a16bcd9342bb378d987");
		} catch (e) {
			console.log(e);
		}
	}

	async function txOutput() {
		/*
		const output = await accessChain(txId).then((result) => {
			const fLen = result.vout.length;
			for (let i = 0; i < fLen; i += 1) {
				const scriptHex = result.vout[i].scriptPubKey.hex;
				const isData = scriptHex.startsWith("006a");
				if (isData) {
					const data = Buffer.from(
						scriptHex.substring(4),
						"hex"
					).toString();
					return data;
				}
			}
			return data;
		});
		return output; */

		const result = await accessChain(txId);
		const fLen = result.vout.length;

		for (let i = 0; i < fLen; i += 1) {
			const scriptHex = result.vout[i].scriptPubKey.hex;
			const isData = scriptHex.startsWith("006a");
			if (isData) {
				const data = Buffer.from(
					scriptHex.substring(4),
					"hex"
				).toString();
				return data;
			}
		}
		return data;
	}

	const outputToWeb = await txOutput();
	console.log(outputToWeb);
	return outputToWeb;
}

// const output = getTx(
//	"da7f03b60031622097049245365be31cf02e729fafedd94099f6f0e7bf178e33"
// );

module.exports = getTx;
