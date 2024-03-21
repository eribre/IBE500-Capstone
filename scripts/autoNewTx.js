/* eslint-disable func-names */
/* eslint-disable consistent-return */
process.env.NETWORK = "testnet";

const WhatsApi = require("whatsonchain/index");

const {
	Address,
	TxBuilder,
	TxOut,
	KeyPair,
	Bn,
	PrivKey,
	Script,
} = require("bsv2");

console.log("Executing on the", process.env.NETWORK);

// Parameters needed for TxBuilder and filling them with the spending output/UTXO values from previous transaction.
// To get the values below for a given UTXO see whatsonchain

const woc = new WhatsApi("testnet");

const accessChain = async function (param) {
	console.log("Contacting WhatsOnChain...");
	try {
		return await woc.utxos(param);
	} catch (e) {
		console.log(e);
	}
};

/* Parameters needed for TxBuilder and filling them with the spending output/UTXO values from previous transaction.
const utxoFrom = 'n1y9iHhiuPwmyK8LacntkLL3RJHcJLXSjT'
const utxoValue = 861883  //-- Update this for every new tx
const utxoIndex = 1  //-- Update this for every new tx
const utxoTxid = 'da7f03b60031622097049245365be31cf02e729fafedd94099f6f0e7bf178e33'
*/
async function broadcastTx(utxos) {
	const utxoFrom = "mfYpRcDWHcURwjJqyT3SweQTMoPFqppPkc";
	const utxoValue = utxos[1].value;
	const utxoIndex = utxos[1].tx_pos; // -- Update this for every new tx
	const utxoTxid = utxos[1].tx_hash;
	const utxoPrivkeyWif =
		"cUjurwZvDzJUS8y9NmocxKCr98TfmPVvNTyas5CsZabbftoYtbr4"; // -- Here write your Private Key using the Wif format
	const changeAddr = "mfYpRcDWHcURwjJqyT3SweQTMoPFqppPkc";

	// Start to build the tx. Everything about Building transactions is present at Github : bsv/lib/tx-builder.js
	const utxoFund = TxOut.fromProperties(
		// satoshis in output, script
		Bn().fromNumber(utxoValue),
		Address.Testnet.fromString(utxoFrom).toTxOutScript()
	);

	const utxoTxidBuff = Buffer.from(utxoTxid, "hex").reverse();

	const keyPairs = [
		KeyPair.Testnet.fromPrivKey(PrivKey.fromWif(utxoPrivkeyWif)),
	];

	const msgToWrite = ["You can fight like a krogan, run like a leopard..."]; // Here your data, comma separated list

	const builder = new TxBuilder();

	console.log("Min. satoshis in the tx output: ", builder.dust);

	builder.inputFromPubKeyHash(utxoTxidBuff, utxoIndex, utxoFund); // tx.id, utxo.n, utxo.value, utxo.address

	const data = msgToWrite.map((str) =>
		// Admits several strings on the list msgToWrite
		Buffer.from(str)
	);

	/* See bsv\lib\tx-builder.js
        A script to send funds to, along with the amount. The amount should be denominated in satoshis, not bitcoins.
        .outputToScript (satoshis, script)
        */
	builder.outputToScript(Bn().fromNumber(0), Script.fromSafeDataArray(data));

	builder.setChangeAddress(Address.Testnet.fromString(changeAddr)); // Set change address

	builder.build(); // This saves the tx inside the "tx" attribute. Build tx

	builder.signWithKeyPairs(keyPairs); // sign

	const signedTx = builder.tx.toHex();

	console.log(signedTx); // Signed tx

	const result = woc.broadcast(signedTx); // Here we broadcast the new built raw transaction!

	return result;
}

const pubAddr = "mfYpRcDWHcURwjJqyT3SweQTMoPFqppPkc";
accessChain(pubAddr).then((result) =>
	broadcastTx(result).then((txReturn) => console.log(txReturn))
);

// Returns the newly created and broadcasted txid
