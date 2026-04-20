const express = require('express');
const router = express.Router();

let accounts = require('../data/accounts');


// GET all accounts
router.get('/', (req, res) => {
    res.json(accounts);
});


// GET account by accountNumber
router.get('/:accountNumber', (req, res) => {

    const accountNumber = parseInt(req.params.accountNumber);

    const account = accounts.find(acc => acc.accountNumber === accountNumber);

    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
});


// POST create account
router.post('/', (req, res) => {

    const newAccount = req.body;

    accounts.push(newAccount);

    res.status(201).json(newAccount);
});


// PUT update account
router.put('/:accountNumber', (req, res) => {

    const accountNumber = parseInt(req.params.accountNumber);

    const account = accounts.find(acc => acc.accountNumber === accountNumber);

    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    const { name, balance, currency } = req.body;

    if (name !== undefined) account.name = name;
    if (balance !== undefined) account.balance = balance;
    if (currency !== undefined) account.currency = currency;

    res.json(account);
});


// DELETE account
router.delete('/:accountNumber', (req, res) => {

    const accountNumber = parseInt(req.params.accountNumber);

    const index = accounts.findIndex(acc => acc.accountNumber === accountNumber);

    if (index === -1) {
        return res.status(404).json({ message: "Account not found" });
    }

    accounts.splice(index, 1);

    res.json({ message: "Account deleted successfully" });
});


// PATCH deposit / withdraw
router.patch('/:accountNumber', (req, res) => {

    const accountNumber = parseInt(req.params.accountNumber);

    const account = accounts.find(acc => acc.accountNumber === accountNumber);

    if (!account) {
        return res.status(404).json({ message: "Account not found" });
    }

    const { amount } = req.body;

    if (typeof amount !== "number") {
        return res.status(400).json({ message: "Invalid amount" });
    }

    account.balance += amount;

    res.json(account);
});

module.exports = router;