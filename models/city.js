const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const citySchema = new Schema({


    city_name: {
        type: String,
        required: true
    }

});







module.exports = mongoose.model('City', citySchema)