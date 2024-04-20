/* eslint-disable global-require */
/* eslint-disable consistent-return */

const { get } = require("../routes");

/* eslint-disable no-undef */
process.env.NETWORK = "testnet";

async function getTx(id) {
	const txId = id;

	const woc = require("whatsonchain");

	/**
	 * Receives the transaction Id and the output index
	 * Retrieves the message stored in that output
	 * If there is no message, it raises an error
	 * @param {string} txId
	 * @param {number} outputIndex
	 * @return {Promise<string>}
	 */
	const getMessage = async function (txId, outputIndex) {
		const whatsonchain = new woc("test");
		let result = await whatsonchain.getRawTxOutputData(txId, outputIndex);
		if (result.startsWith("006a")) {
			return Buffer.from(result.substring(4), "hex").toString();
		} else {
			return Promise.reject("Failure: no message in this output");
		}
	};

	const outputToWeb = await getMessage(txId, 0);
	console.log(outputToWeb);
	return outputToWeb;
}

// const output = getTx(
//	"da7f03b60031622097049245365be31cf02e729fafedd94099f6f0e7bf178e33"
// );

//console.log(
//    getTx("a2424f81dd138cd899994768fed5c80a130fa8ee0917d3d1c5ab75d3b9b16027"),
//);

module.exports = getTx;
