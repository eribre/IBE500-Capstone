/* eslint-disable consistent-return */
process.env.NETWORK = "testnet";

const WhatsApi = require("whatsonchain/index");

console.log("Executing on the", process.env.NETWORK);

// eslint-disable-next-line func-names
const accessChain = async function (param) {
	console.log("Contacting WhatsOnChain...");
	const woc = new WhatsApi("testnet");
	try {
		return await woc.txHash(param);
		// let stat = await woc.status();
		// let tx = await woc.txHash("fac4a416140760fa851a24abc857880209fded46e04a3a16bcd9342bb378d987");
	} catch (e) {
		console.log(e);
	}
};

const txId = "2d7376d71623a3be7b88204be1c1f51c851e94e21fe6a9c124e6af7a84a372c9";
accessChain(txId).then((result) => {
	const fLen = result.vout.length;
	for (let i = 0; i < fLen; i += 1) {
		const scriptHex = result.vout[i].scriptPubKey.hex;
		const isData = scriptHex.startsWith("006a");
		if (isData) {
			console.log(Buffer.from(scriptHex.substring(4), "hex").toString());
		}
	}
});
