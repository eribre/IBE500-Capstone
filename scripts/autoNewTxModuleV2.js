/* eslint-disable consistent-return */
/* eslint-disable func-names */
async function autoNewTx(pubAddr, utxoPrivkeyWif, msgToWrite) {
    // eslint-disable-next-line global-require
    const WhatsApi = require("whatsonchain/index");

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

    console.log("Executing on the", process.env.NETWORK);

    const woc = new WhatsApi("testnet");

    const AccessChain = async function (param) {
        console.log("Contacting WhatsOnChain...");
        try {
            return await woc.utxos(param);
        } catch (e) {
            console.log(e);
        }
    };

    async function broadcastTx(utxos, utxoFrom) {
        const builder = new TxBuilder();

        const fLen = utxos.length;
        for (let i = 0; i < fLen; i += 1) {
            //* Adds all your available utxos as possible inputs for the next tx
            const utxoValue = utxos[i].value;
            const utxoIndex = utxos[i].tx_pos; // -- Update this for every new tx
            const utxoTxid = utxos[i].tx_hash;

            // Start to build the tx. Everything about Building transactions is present at Github : bsv/lib/tx-builder.js
            const utxoFund = TxOut.fromProperties(
                // satoshis in output, script
                Bn().fromNumber(utxoValue),
                Address.Testnet.fromString(utxoFrom).toTxOutScript(),
            );

            const utxoTxidBuff = Buffer.from(utxoTxid, "hex").reverse();

            builder.inputFromPubKeyHash(utxoTxidBuff, utxoIndex, utxoFund); // tx.id, utxo.n, utxo.value, utxo.address
        } // TxIns end

        const changeAddr = utxoFrom;
        const keyPairs = [
            KeyPair.Testnet.fromPrivKey(PrivKey.fromWif(utxoPrivkeyWif)),
        ];

        // Confirm connection and display message being sent
        console.log("Connection successful.");
        console.log("Sending:", msgToWrite);

        const data = msgToWrite.map((str) =>
            // Admits several strings on the list msgToWrite
            Buffer.from(str),
        );

        builder.outputToScript(
            Bn().fromNumber(0),
            Script.fromSafeDataArray(data),
        );

        builder.setChangeAddress(Address.Testnet.fromString(changeAddr)); // Set change address

        builder.build({ useAllInputs: false }); // This saves the tx inside the "tx" attribute. Build tx

        builder.signWithKeyPairs(keyPairs); // sign

        const signedTx = builder.tx.toHex();

        const result = woc.broadcast(signedTx);

        return result;
    }

    async function txid() {
        const output = await AccessChain(pubAddr).then((result) =>
            broadcastTx(result, pubAddr).then((txReturn) => txReturn),
        );
        return output;
    }

    //* Returns the transaction id to the webpage
    const outputToWeb = await txid();
    return outputToWeb;
}

module.exports = autoNewTx;
