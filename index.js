process.env.NETWORK = "testnet";
// code above sets bsv to use testnet rather than mainnet

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// function for broadcasting new transactions
const autoNewTx = require("./scripts/autoNewTxModuleV2");
// function for retrieving data uploaded to the blockchain
const getTx = require("./scripts/getTx");

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
	res.end();
});

/*
* creates new transaction with user input from newTx.pug
TODO: sanetize user input
*/
app.post("/views/finTx", async (req, res) => {
	const { address, utxoPWif, msg } = req.body;
	try {
		const msgTrim = msg.trim();
		const output = await autoNewTx(
			address, // utxoFrom
			utxoPWif, // utxoPrivatekeyWif
			[msgTrim] // msgToWrite
		);
		// writes txId to log file for later use
		fs.appendFileSync("./data/txId.log", `${output}\n`, (err) => {
			if (err) {
				console.error(err);
			}
		});
		res.render("finTx", { output });
		res.end();
	} catch (err) {
		console.log(err);
		res.render("oops");
		res.end();
	}
});

// Displays history of transactions store in log file
app.get("/views/viewHistory", async (req, res) => {
	const array = fs.readFileSync("./data/txId.log", "utf-8").split("\n");
	res.render("viewHistory", { array });
	res.end();
});

// Old way of viewing data. Only displays single transaction.
app.post("/views/outData", async (req, res) => {
	const { transaction } = req.body;
	// transaction = transaction.trim();
	try {
		let outputData = await getTx(transaction.trim());
		outputData = outputData.substring(1);
		// outputData = JSON.stringify(outputData);
		console.log(outputData);
		const outputList = outputData.split(",");
		console.log(outputList.length);

		if (outputList.length !== 6) {
			res.render("oops");
		} else {
			res.render("outData", { outputList });
			res.end();
		}
	} catch (err) {
		console.log(err);
		res.render("oops");
		res.end();
	}
});

// Original solution to viewing all data from op_return
// TODO check that op_return is in supporting format
app.get("/views/sumData", async (req, res) => {
	try {
		const rawData = fs.readFileSync("./data/txId.log", "utf-8").split("\n");
		rawData.pop();
		console.log(rawData.length);
		res.setHeader("Content-Type", "text/html");
		res.write(
			"<table><tr><th>Firm</th><th>Supplier</th><th>Nr. Caught</th><th>Nr. Bought</th><th>Nr. Sold</th><th>Buyer</th></tr>"
		);

		for (let i = 0; i < rawData.length; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			let outCsv = await getTx(rawData[i]);
			outCsv = outCsv.substring(1);
			const oLst = outCsv.split(",");
			res.write("<tr>");
			res.write(
				`<td>${oLst[0]}</td><td>${oLst[1]}</td><td>${oLst[2]}</td><td>${oLst[3]}</td><td>${oLst[4]}</td><td>${oLst[5]}</td>`
			);
			res.write("</tr>");
		}
		res.write("</table>");
		res.write("<h2> Summary </h2>");
		for (let j = 0; j < rawData.length; j += 1) {
			// eslint-disable-next-line no-await-in-loop
			let outCsv = await getTx(rawData[j]);
			outCsv = outCsv.substring(1);
			const oLst = outCsv.split(",");
			// if an amount was cought write to page
			if (oLst[2] > 0) {
				res.write(`${oLst[0]} has caught ${oLst[2]} kg of fish`);
				res.write("<br/>");
			}
			// if an amount was bought write to page
			if (oLst[3] > 0) {
				res.write(
					`${oLst[0]} has bought ${oLst[3]} kg of fish from ${oLst[1]}`
				);
				res.write("<br/>");
			}
			// if an amount was sold write to page
			if (oLst[4] > 0) {
				res.write(
					`${oLst[0]} has sold ${oLst[4]} kg of fish to ${oLst[5]}`
				);
				res.write("<br/>");
			}
		}
		res.end();
	} catch (err) {
		res.render("oops");
		res.end();
	}
});

// Slightly better solution to viewing all data from op_return
// TODO check that op_return is in supporting format
app.get("/views/sumDataV2", async (req, res) => {
	const rawData = fs.readFileSync("./data/txId.log", "utf-8").split("\n");
	rawData.pop();
	console.log(rawData.length);

	const arr = {};
	for (let i = 0; i < rawData.length; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		let outCsv = await getTx(rawData[i]);
		outCsv = outCsv.substring(1);
		const oLst = outCsv.split(",");
		arr[i] = {
			firm: oLst[0],
			supplier: oLst[1],
			caught: oLst[2],
			bought: oLst[3],
			sold: oLst[4],
			buyer: oLst[5],
		};
	}
	res.render("sumDataV2", { arr });
	res.end();
});

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
