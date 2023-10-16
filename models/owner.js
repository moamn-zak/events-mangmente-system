const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ownerSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
        //  required: true
    },
    wallet: {
        type: Number,
        default: 0,
        // required: true
    },
    accountNum: {
        type: String,
        required: true
    },
    // bankaccount: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'BankAccount'
    // },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Event'
    }]

});

module.exports = mongoose.model('Owner', ownerSchema)