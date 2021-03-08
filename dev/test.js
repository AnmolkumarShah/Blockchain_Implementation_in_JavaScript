const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const previousBlockHash = "JSHDAUSDVAJHSXJahx9ajvh";
const currentBlockData = [
  { amount: 101, sender: "ksajcskjdclakswl", recipient: "aijsdwiydv wuu qwd" },
  { amount: 201, sender: "ksajcskjdclakswl", recipient: "aijsdwiydv wuu q d" },
  { amount: 301, sender: "ksajcskjdclakswl", recipient: "aijsdwiydv wuu qwd" },
];

// console.log(bitcoin.proofOfWork(previousBlockHash, currentBlockData));

// console.log(bitcoin.hashBlock(previousBlockHash, currentBlockData, 27618));

console.log(bitcoin);
