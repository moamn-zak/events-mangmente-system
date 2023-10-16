const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({

    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    content: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);


module.exports = mongoose.model('Comment', commentSchema)