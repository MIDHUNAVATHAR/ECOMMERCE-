const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletTransactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'] , 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    balanceAfterTransaction: {
        type: Number,
        required: true
    }
}, { timestamps: true });



const WalletTransaction = mongoose.model( 'WalletTransaction' , walletTransactionSchema );
module.exports = WalletTransaction;
