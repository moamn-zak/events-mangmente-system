const { time } = require('console');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pplNum: {
        type: Number,
        required: true
    },
    pplCount: {
        type: Number,
        default: 0,
        // required: true
    },
    date: {
        type: Date,
        //  required: true
    },
    times: {
        type: String,
        //  required: true
    },
    timee: {
        type: String,
        //  required: true
    },
    status: {
        type: String,
        default: 'pending'
        //  required: true
    },

    creator: {
        type: Schema.Types.ObjectId,
        ref: 'Owner',
        require: true
    },
    clients: [{
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]


},
    { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema)