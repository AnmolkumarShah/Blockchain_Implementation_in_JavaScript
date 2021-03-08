const express = require("express");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require("uuid/v1");
const rp = require("request-promise");

let port = process.argv[2]; // for port
port = parseInt(port);

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

// register a node and broadcast it to other network
app.post("/register-and-broadcast-node", function (req, res, next) {
  // request to register a new network
  const newNodeUrl = req.body.newNodeUrl;

  // if early it is not present, then add otherwise remain as it is.
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1)
    bitcoin.networkNodes.push(newNodeUrl);

  // this is array of promises
  const regNodesPromises = [];

  // runs for all the regsitered network nodes and tell then a new network wants to be registered.
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    // "/register-node" endpoint

    // REQUEST OBJECT
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };

    // push to promise array
    regNodesPromises.push(rp(requestOptions));
  });

  // time to resolve all promises
  Promise.all(regNodesPromises)
    .then((data) => {
      // sending data of all previously connected network to the network which makes request to join

      // REGISTRATION OBJECT
      const bulkRegisterOption = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNode: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
        },
        json: true,
      };

      return rp(bulkRegisterOption);
    })
    .then((data) => {
      res.json({ note: "New Network Registered Successfully" });
    });
});

// register a node with the network
app.post("/register-node", function (req, res, next) {
  const newNodeUrl = req.body.newNodeUrl;

  // if the new node it not in network nodes and it should not be itself
  if (
    bitcoin.networkNodes.indexOf(newNodeUrl) == -1 &&
    bitcoin.currentNodeUrl !== newNodeUrl
  )
    bitcoin.networkNodes.push(newNodeUrl);
  res.json({ note: "New Node Registered Successfully" });
});

// register multiple nodes at once
app.post("/register-nodes-bulk", function (req, res, next) {
  const allNetworkNode = req.body.allNetworkNode;
  try {
    allNetworkNode.forEach((networkNodeUrl) => {
      if (
        bitcoin.currentNodeUrl !== networkNodeUrl &&
        bitcoin.networkNodes.indexOf(networkNodeUrl) == -1
      )
        bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({ note: "Bulk Registration successfully" });
  } catch (e) {
    res.send(e);
  }
});

app.listen(port, function () {
  console.log(`listening to port ${port}`);
});
