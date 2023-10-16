const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clientSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
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
    age: {
        type: Number,
        required: true
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
    }],
    // comments: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Comment'
    // }]

});

module.exports = mongoose.model('Client', clientSchema)