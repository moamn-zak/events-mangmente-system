const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { randomInt } = require('crypto');


const clientRoutes = require('./routes/client');
const ownerRoutes = require('./routes/owner');
const eventRoutes = require('./routes/event');
const adminRoutes = require('./routes/admin')
// const bankRoutes = require('./VBank/routers/bank')




const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, 'images');
    },
    filename: (req, file, cb) =>
    {
        cb(null, randomInt(999999) + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) =>
{
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg')
    {
        cb(null, true);
    } else
    {
        cb(null, false);
    }
};


app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
        '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(bodyparser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use('/client', clientRoutes);
app.use('/owner', ownerRoutes);
app.use('/event', eventRoutes);
app.use('/admin', adminRoutes);
// app.use('/bank', bankRoutes);






app.use((error, req, res, next) =>
{
    // console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});

mongoose.connect('')
    .then(result =>
    {
        app.listen(8080);
        console.log('connected sccessfully')
    })
    .catch(err => { console.log(err); });
