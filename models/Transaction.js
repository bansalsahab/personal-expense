const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
