// const sqlite3 = require('sqlite3').verbose();

const express = require('express');
const app = express();
const sha256 = require('crypto-js/sha256');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

class Block {
    constructor(
        index,
        timestamp,
        transaction,
        precedingHash
    ) {
        this.index = index;
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.precedingHash = precedingHash;
        this.hash = this.computeHash();
    }

    computeHash() {
        return sha256(
            this.index + 
            this.precedingHash +
            this.timestamp +
            JSON.stringify(this.transaction)
        ).toString();
    }
}

class BlockChain {
    constructor() {
        this.id = '';
        this.name = '';
        this.blockchain = '';
        this.difficulty = '';
    }

    create(id, name, genesis) {
        this.id = id;
        this.name = name;
        this.blockchain = [this.startGenesisBlock(genesis)];
        this.difficulty = 4;
    }

    startGenesisBlock(genesis) {
        return new Block(
            0,
            genesis.date,
            genesis.transaction,
            "0"
        );
    }

    obtainLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }

    addNewBlock(newBlock) {
        newBlock.precedingHash = this.obtainLatestBlock().hash;
        newBlock.hash = newBlock.computeHash();
        this.blockchain.push(newBlock);
    }

    checkChainValidity() {
        for (let i = 1; i < this.blockchain.length; i++) {
            const currentBlock = this.blockchain[i];
            const precedingBlock = this.blockchain[i - 1];
            if (currentBlock.hash !== currentBlock.computeHash()) {
                return false;
            }
            if (currentBlock.precedingHash !== precedingBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

const GlobalChain = new BlockChain();

class MyBlock {
    constructor() {
        this.chain = [];
    }

    validdateNewChain = (req, res, next) => {
        if (req.body) {
            if (req.body.id && 
                req.body.name && 
                req.body.genesis && 
                req.body.genesis.date && 
                req.body.genesis.transaction && 
                req.body.genesis.transaction)
            {
                next();
            } else {
                res.status(400).json({ message: 'Request format is not correct' });
            }
        } else {
            res.status(400).json({ message: 'Request format is not correct' });
        }
    }

    createNewChain = (req, res) => {
        GlobalChain.create(
            req.body.id,
            req.body.name,
            req.body.genesis
        )
        res.status(200).json({ message: 'Chain created', data: GlobalChain });
    }

    appendNewChild = (req, res) => {
        const block = new Block(
            this.chain.length,
            req.body.timestamp,
            req.body.transaction
        )
        GlobalChain.addNewBlock(block);
        res.status(200).json({ message: 'Block added' });
    }

    getChain = (req, res) => {
        res.status(200).json({ chain: GlobalChain });
    }
}

const Controller = new MyBlock();

app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Welcome to my Blockchain!'})
});
app.post('/api/blockchain', Controller.validdateNewChain, Controller.createNewChain);
app.get('/api/blockchain', Controller.getChain);
app.post('/api/blockchain/append', Controller.appendNewChild);

app.listen(9090, () => {
    console.log('Your blockchain is running at http://localhost:9090')
})