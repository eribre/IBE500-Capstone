process.env.NETWORK = "testnet";
// code above sets bsv to use testnet rather than mainnet

const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

const newTx = require("./scripts/newTx");

const routes = require("./routes");

// Set up pug and point to view folder
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// tells app to use routes
app.use("/", routes);

// readies app for user input via post method
app.use(
	express.urlencoded({
		extended: true,
	})
);

// renders main page
app.get("/", (req, res) => {
	res.render("index");
});

/*
* creates new transaction with user input from newTx.pug
TODO: sanetize user input
*/
app.post("/view/finTx", (req, res) => {
	const {
		address,
		utxoTxid,
		utxoValue,
		utxoIndex,
		utxoPWif,
		changeAddr,
		msg,
	} = req.body;
	// console.log(utxoIndex);
	const output = newTx(
		address, // utxoFrom
		Number(utxoValue), // utxoValue
		Number(utxoIndex), // utxoIndex
		utxoTxid, // utxoTxid
		utxoPWif, // utxoPrivatekeyWif
		changeAddr, // changeAddr
		[msg] // msgToWrite
	);
	res.render("finTx", { output });
	res.end();
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
