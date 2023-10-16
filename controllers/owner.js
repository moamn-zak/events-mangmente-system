const path = require('path');
const fs = require('fs');



const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




const Owner = require('../models/owner');
const Event = require('../models/event');
const Client = require('../models/client');


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
    const username = req.body.username;
    const imageUrl = 'images/' + req.file.filename;
    const address = req.body.address;
    const phone = req.body.phone;
    const accountNum = req.body.accountNum;
    Client.findOne({ email: email })
        .then(client =>
        {
            if (client)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }

            return Owner.findOne({ email: email })
        })
        .then(owner =>
        {
            if (owner)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }
            return Owner.findOne({ username: username })
        })
        .then(username =>
        {
            if (username)
            {
                const err = new Error('username already exist');
                err.statusCode = 404;
                throw err;
            }
            return bcrypt.hash(password, 12)
        })
        .then(hashpd =>
        {
            const owner = new Owner({
                email: email,
                password: hashpd,
                username: username,
                address: address,
                phone: phone,
                imageUrl: imageUrl,
                accountNum: accountNum

            });
            return owner.save();
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

exports.login = async (req, res, next) =>
{
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            const error = new Error('Validation failed, entered data is incorrect.');
            error.statusCode = 422;
            throw error;
        }

        const email = req.body.email;
        const password = req.body.password;

        let loadedUser = null;
        let userType = null;

        const client = await Client.findOne({ email: email });
        const owner = await Owner.findOne({ email: email });

        if (!client && !owner)
        {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        if (client)
        {
            loadedUser = client;
            userType = 'client';
        } else if (owner)
        {
            loadedUser = owner;
            userType = 'owner';
        }

        const isPasswordValid = await bcrypt.compare(password, loadedUser.password);
        if (!isPasswordValid)
        {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            type: userType
        }, 'hi', { expiresIn: '30d' });

        res.status(200).json({
            message: 'Logged in',
            token: token,
            type: userType,
            user: loadedUser
        });
    } catch (err)
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
};



const axios = require('axios');
const url = 'http://localhost:8081/bank/';

exports.get_profile = async (req, res, next) =>
{
    try
    {
        const ownerId = req.userId;
        const owner = await Owner.findById(ownerId)

        if (!owner)
        {
            const err = new Error('owner not found');
            err.statusCode = 404;
            throw err;
        }

        const paymentResponse = await axios.get(url + 'getBalance/' + owner.accountNum);
        // console.log(paymentResponse.data.balance);
        owner.wallet = paymentResponse.data.balance;
        await owner.save();

        res.status(200).json({ message: 'owner fetched.', owner: owner });
    } catch (err)
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
};







// exports.get_profile = (req, res, next) =>
// {
//     const ownerId = req.userId;
//     return Owner.findById(ownerId)
//         .then(owner =>
//         {
//             if (!owner)
//             {
//                 const err = new Error('owner not found');
//                 err.statusCode = 404;
//                 throw err;
//             }
//             res.status(200).json({ message: 'owner fatched.', owner: owner });

//         }).catch(err =>
//         {
//             if (!err.statusCode)
//             {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });

// };

exports.edit_profile = (req, res, next) =>
{
    const ownerId = req.userId;

    const email = req.body.email;
    const username = req.body.username;
    const address = req.body.address;
    const phone = req.body.phone;
    const accountNum = req.body.accountNum;
    let imageUrl;


    Owner.findOne({ email: email })
        .then(owner =>
        {
            if (owner)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }
            return Owner.findOne({ username: username });
        }).then(username =>
        {
            if (username)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const err = new Error('username already exist');
                err.statusCode = 404;
                throw err;
            }
            return Owner.findById(ownerId);
        })
        .then(owner =>
        {
            if (!owner)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const err = new Error('Owner not found');
                err.statusCode = 404;
                throw err;
            }
            if (req.file)
            {
                imageUrl = 'images/' + req.file.filename;

            }
            if (!imageUrl)
            {
                imageUrl = owner.imageUrl;
            }
            if (imageUrl !== owner.imageUrl)
            {
                clearImage(owner.imageUrl);
            }
            owner.email = email;
            owner.username = username;
            owner.imageUrl = imageUrl;
            owner.address = address;
            owner.phone = phone;
            owner.accountNum = accountNum;
            return owner.save();
        }).then(result =>
        {
            res.status(200).json({ message: 'profile updated.', owner: result });
        }).catch(err =>
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

