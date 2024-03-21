### Hi, thanks for having a look at my bsv based project

#### MAKE SURE THAT DEPENDENCIES ARE INSTALLED!!

Node_modules is included, but it doesn't hurt to double check.

This project requires bsv, whatsonchain, expressjs and pug (for html templates) to function.

To start the server, run "node index.js" with this folder as the working directory.  
(old_index.js is as the name suggests, outdated)

Then go to a browser of your choice (this has only been tested in firefox though),  
and enter http://localhost:3000

You should now be on the main page, click the first link (**new transaction**) to go to the  
tool for creating new transactions.

**Display previous transaction IDs** displays all transaction IDs that are saved in the log file.

**The tool for viewing transactions** only displays a single op_return at a time, but you have full control of the tx_id.

**Tool for viewing sum of previous transactions** is the older and not fully functional solution to the requirements given by the task.

**Tool for viewing sum of previous transactions V2** is the slightly better solution, that for now relies on hardcoded firm names (to be changed).
