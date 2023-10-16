const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const path = require('path');
const fs = require('fs');



const Client = require('../models/client');
const Event = require('../models/event');
const Comment = require('../models/comment');
const Owner = require('../models/owner');


exports.signup = (req, res, next) =>
{
    const error = validationResult(req);
    if (!error.isEmpty())
    {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file)
    {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const imageUrl = 'images/' + req.file.filename;
    const gender = req.body.gender;
    const address = req.body.address;
    const phone = req.body.phone;
    const age = req.body.age;
    const accountNum = req.body.accountNum;


    Owner.findOne({ email: email })
        .then(owner =>
        {
            if (owner)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }

            return Client.findOne({ email: email })
        })
        .then(client =>
        {
            if (client)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }

            return bcrypt.hash(password, 12)
        })
        .then(hashpd =>
        {
            const client = new Client({
                email: email,
                password: hashpd,
                name: name,
                imageUrl: imageUrl,
                gender: gender,
                address: address,
                phone: phone,
                age: age,
                accountNum: accountNum
            });
            return client.save();
        })
        .then(resu =>
        {
            res.status(201).json({ message: 'User created succsasfuly', userId: resu._id })
        })
        .catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });

};


const axios = require('axios');
const url = 'http://localhost:8081/bank/';

exports.get_profile = async (req, res, next) =>
{
    try
    {
        const clientId = req.userId;
        const client = await Client.findById(clientId);

        if (!client)
        {
            const err = new Error('Client not found');
            err.statusCode = 404;
            throw err;
        }

        const paymentResponse = await axios.get(url + 'getBalance/' + client.accountNum);
        console.log(paymentResponse.data.balance);
        client.wallet = paymentResponse.data.balance;
        await client.save();

        res.status(200).json({ message: 'Client fetched.', client: client });
    } catch (err)
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
};








// const axios = require('axios');
// const url = 'http://localhost:8081/bank';
// exports.get_profile = (req, res, next) =>
// {
//     const clientId = req.userId;
//     Client.findById(clientId).then(client =>
//     {
//         if (!client)
//         {
//             const err = new Error('Client not found');
//             err.statusCode = 404;
//             throw err;
//         }
//         const paymentResponse = axios.get(url + '/getBalance/' + client.accountNum);

//         client.wallet = paymentResponse;
//         client.save();
//     }).then(user =>
//     {
//         res.status(200).json({ message: 'client fatched.', client: user });
//     }).catch(err =>
//     {
//         if (!err.statusCode)
//         {
//             err.statusCode = 500;
//         }
//         next(err);
//     });

// };


exports.edit_profile = (req, res, next) =>
{
    const clientId = req.userId;
    const email = req.body.email;
    const name = req.body.name;
    const gender = req.body.gender;
    const address = req.body.address;
    const phone = req.body.phone;
    const age = req.body.age;
    const accountNum = req.body.accountNum;

    let imageUrl;


    Client.findOne({ email: email })
        .then(client =>
        {
            if (client)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const error = new Error('this Email already exist');

                error.statusCode = 401;
                throw error;
            }
            return Client.findById(clientId)
        })

        .then(client =>
        {
            if (!client)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const err = new Error('Client not found');
                err.statusCode = 404;
                throw err;
            }
            if (req.file)
            {
                imageUrl = 'images/' + req.file.filename;

            }
            if (!imageUrl)
            {
                imageUrl = client.imageUrl;
            }
            if (imageUrl !== client.imageUrl)
            {
                clearImage(client.imageUrl);
            }
            client.email = email;
            client.name = name;
            client.imageUrl = imageUrl;
            client.gender = gender;
            client.address = address;
            client.phone = phone;
            client.age = age;
            client.accountNum = accountNum;

            return client.save();
        }).then(result =>
        {
            res.status(200).json({ message: 'profile updated.', client: result });
        }).catch(err =>
        {
            if (req.file)
            {
                clearImage('images/' + req.file.filename);
            }
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};






exports.getacceptedEvents = async (req, res, next) =>
{
    try
    {
        if (!req.userId)
        {
            const error = new Error('there is no client id');
            error.statusCode = 404;
            throw error;
        }

        const acceptedEvents = await Event.find({ status: 'accepted' });

        const bookedEventIds = acceptedEvents
            .filter(event => event.clients.includes(req.userId))
            .map(event => event._id);

        const events = acceptedEvents.filter(event => !bookedEventIds.includes(event._id));

        res.status(200).json({ message: 'Fetched events successfully.', events: events });
    } catch (err)
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
};









exports.addComment = (req, res, next) =>
{


    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Entered data is incorrect...');
        error.statusCode = 422;
        throw error;
    }
    const clientId = req.userId;
    const eventId = req.body.eventId;//const eventId = req.params.eventId;
    const content = req.body.content;

    const comment = new Comment({
        client: clientId,
        event: eventId,
        content: content
    });
    Event.findById(eventId)
        .then(event =>
        {
            if (!event)
            {
                const error = new Error('Could not find event.');
                error.statusCode = 404;
                throw error;
            }
            comment.save();
            event.comments.push(comment);
            return event.save()

        })
        .then(result =>
        {
            res.status(200).json({ message: 'comment added.', event: result, comment: comment.content });
        })
        .catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};


const clearImage = filePath =>
{
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err => { if (err) { console.log(err) } }));
};



