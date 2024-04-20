function newTX(
	utxoFrom,
	utxoValue,
	utxoIndex,
	utxoTxid,
	utxoPWif,
	changeAddr,
	msg
) {
	const {
		Address,
		TxBuilder,
		TxOut,
		KeyPair,
		Bn,
		PrivKey,
		Script,
		// eslint-disable-next-line global-require
	} = require("bsv2");

	const utxoFund = TxOut.fromProperties(
		// satoshis in output, script
		Bn().fromNumber(utxoValue),
		Address.Testnet.fromString(utxoFrom).toTxOutScript()
	);

	const utxoTxidBuff = Buffer.from(utxoTxid, "hex").reverse();

	const keyPairs = [KeyPair.Testnet.fromPrivKey(PrivKey.fromWif(utxoPWif))];

	const builder = new TxBuilder();

	builder.inputFromPubKeyHash(utxoTxidBuff, utxoIndex, utxoFund); // tx.id, utxo.n, utxo.value, utxo.address

	const data = msg.map((str) =>
		// Admits several strings on the list msgToWrite.
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

	return builder.tx.toHex(); // Signed tx
}

module.exports = newTX;
