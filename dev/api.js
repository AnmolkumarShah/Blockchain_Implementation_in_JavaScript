const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid/v1");

const app = express();
const bitcoin = new Blockchain();
const nodeAddress = uuid().split("-").join("");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res, next) => {
  res.send(bitcoin);
});

app.post("/transaction", (req, res, next) => {
  const amount = req.body.amount;
  const sender = req.body.sender;
  const recipient = req.body.recipient;

  const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

app.get("/mine", (req, res, next) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transaction: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  bitcoin.createNewTransaction(12.5, "00", nodeAddress);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    note: "New Block Mined Successfully",
    block: newBlock,
  });
});

app.listen(3000, function () {
  console.log("listening to port 3000");
});
