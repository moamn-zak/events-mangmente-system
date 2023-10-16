const { validationResult } = require('express-validator');
const { Mutex } = require('async-mutex');

const path = require('path');
const fs = require('fs');




const Client = require('../models/client');
const Owner = require('../models/owner');
const Event = require('../models/event');
const client = require('../models/client');

exports.creatEvent = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed...');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file)
    {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = 'images/' + req.file.filename;
    const title = req.body.title;
    const content = req.body.content;
    const price = req.body.price;
    const city = req.body.city;
    const date = req.body.date;
    const times = req.body.times;
    const timee = req.body.timee;
    const address = req.body.address;
    const pplNum = req.body.pplNum;
    let creator = req.userId;

    // const datetimeString = date + 'T' + timee;

    //console.log(datetimeString);

    const event = new Event({
        title: title,
        content: content,
        imageUrl: imageUrl,
        price: price,
        city: city,
        times: times,
        timee: timee,
        date: date,//new Date(datetimeString)
        address: address,
        pplNum: pplNum,
        creator: creator
    });
    //   console.log(req.userId);

    Owner.findById(req.userId)
        .then(owner =>
        {
            if (!owner)
            {
                const error = new Error('Owner not found.');
                error.statusCode = 404;
                throw error;
            }
            if (owner.status !== 'activited')
            {
                const error = new Error('you have no parmitions to create event.');
                error.statusCode = 403;
                throw error;
            }
            event.save()
            creator = owner;
            owner.events.push(event);
            return owner.save();
        }).then(result =>
        {
            // console.log(result);
            res.status(201).json({
                message: 'Event created successfully!',
                event: event,
                creator: { _id: creator._id, name: creator.name }
            });
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

exports.updateEvent = (req, res, next) =>
{
    //    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed...');
        error.statusCode = 422;
        throw error;
    }
    const { eventId, title, content, price, city, address, pplNum, times, timee, date } = req.body;

    // const title = req.body.title;
    // const content = req.body.content;
    // const price = req.body.price;
    // const city = req.body.city;
    // const address = req.body.address;
    // const pplNum = req.body.pplNum;
    // const status = req.body.status;

    let imageUrl;//= req.body.image;//'images/' + req.file.filename;


    // if (!imageUrl)
    // {
    //     const error = new Error('No file picked.');
    //     error.statusCode = 422;
    //     throw error;
    // }
    Event.findById(eventId)
        .then(event =>
        {

            if (!event)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const error = new Error('Could not find event.');
                error.statusCode = 404;
                throw error;
            }
            // if (event.status !== 'pending')
            // {
            // if(req.file)
            // {
            //     clearImage('images/' + req.file.filename);
            // }
            //     const error = new Error('you can not edit it after accepted.');
            //     error.statusCode = 403;
            //     throw error;
            // }
            if (event.creator.toString() !== req.userId)
            {
                if (req.file)
                {
                    clearImage('images/' + req.file.filename);
                }
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }
            if (req.file)
            {
                imageUrl = 'images/' + req.file.filename;

            }
            if (!imageUrl)
            {
                imageUrl = event.imageUrl;
            }
            if (imageUrl !== event.imageUrl)
            {
                clearImage(event.imageUrl);
            }
            event.title = title;
            event.content = content;
            event.imageUrl = imageUrl;
            event.city = city;
            event.address = address;
            event.price = price;
            event.pplNum = pplNum;
            event.times = times;
            event.timee = timee;
            event.date = date;

            // event.status = status;


            return event.save();
        })
        .then(result =>
        {
            res.status(200).json({ message: 'Event updated.', event: result });

        }

        )
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
const url = 'http://localhost:8081/bank';

exports.booking = async (req, res, next) =>
{
    const ticketMutex = new Mutex();

    try
    {
        const clientId = req.userId;
        const eventId = req.body.eventId;

        const release = await ticketMutex.acquire();

        const client = await Client.findById(clientId);
        if (!client)
        {
            release();
            return res.status(404).json({ message: 'Could not find client.' });
        }

        const event = await Event.findById(eventId);
        if (!event)
        {
            release();
            return res.status(404).json({ message: 'Could not find event.' });
        }

        const owner = await Owner.findById(event.creator);
        if (!owner)
        {
            release();
            return res.status(400).json({ message: 'Could not find owner.' });
        }

        if (event.pplCount >= event.pplNum)
        {
            release();
            return res.status(500).json({ message: 'Event is full.' });
        }

        const paymentResponse = await axios.post(url + '/pay', {
            senderAccNum: client.accountNum,
            receiverAccNum: owner.accountNum,
            amount: event.price,
        });

        if (paymentResponse.status !== 200)
        {
            release();
            const errorMessage = paymentResponse.data.message;
            return res.status(400).json({ message: errorMessage });
        }

        event.pplCount = event.pplCount + 1;
        event.clients.push(client);
        client.events.push(event);
        await event.save();
        await client.save();

        release();

        return res.status(201).json({
            message: 'Event booked successfully!',
            event: event,
        });

    } catch (err)
    {

        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
}








exports.getacceptedEvents = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Event.find().countDocuments()
        .then(count =>
        {
            totalItems = count;
            if (req.type == 'owner')
            {
                return Event.find({ status: 'accepted', creator: req.userId })
                    .populate('creator', 'username');

            } if (req.type == 'client')
            {

                return Event.find({ status: 'accepted', clients: req.userId })
                    .populate('creator', 'username');

            } else
            {
                return Event.find({ status: 'accepted' })
                    .populate('creator', 'username');
            }
            // .skip((currentPage - 1) * perPage)
            // .limit(perPage);
        })
        .then(events =>
        {

            res
                .status(200)
                .json({ message: 'Fetched events successfully.', events: events });//totalItems: totalItems


        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getpendingEvents = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Event.find().countDocuments()
        .then(count =>
        {
            totalItems = count;
            if (req.type == 'owner')
            {
                return Event.find({ status: 'pending', creator: req.userId })
                    .populate('creator', 'username');
            } else
            {
                return Event.find({ status: 'pending' })
                    .populate('creator', 'username');
            }
            // .skip((currentPage - 1) * perPage)
            // .limit(perPage);
        })
        .then(events =>
        {

            res
                .status(200)
                .json({ message: 'Fetched events successfully.', events: events });//totalItems: totalItems

        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};







exports.getcancelledEvents = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Event.find().countDocuments()
        .then(count =>
        {
            totalItems = count;
            if (req.userId)
            {
                return Event.find({ status: 'cancelled', creator: req.userId })
                    .populate('creator', 'username');
            } else
            {
                return Event.find({ status: 'cancelled' })
                    .populate('creator', 'username');
            }
            // .skip((currentPage - 1) * perPage)
            // .limit(perPage);
        })
        .then(events =>
        {

            res
                .status(200)
                .json({ message: 'Fetched events successfully.', events: events });//totalItems: totalItems

        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};



exports.getfinishedEvents = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }

    Event.find({ status: 'accepted' })
        .then((events) =>
        {
            events.forEach((event) =>
            {
                const timeComponents = event.timee.split(':');
                const hours = parseInt(timeComponents[0], 10);
                const minutes = parseInt(timeComponents[1], 10);
                const newDate = new Date(event.date);
                newDate.setHours(hours);
                newDate.setMinutes(minutes);

                if (newDate < new Date())
                {
                    event.status = 'finished';
                    event.save();
                }
            });

            let eventQuery;

            if (req.type == 'owner')
            {
                eventQuery = Event.find({ status: 'finished', creator: req.userId });
            } else if (req.type == 'client')
            {
                eventQuery = Event.find({ status: 'finished', clients: req.userId });
            } else
            {
                eventQuery = Event.find({ status: 'finished' });
            }

            eventQuery = eventQuery
                .populate('creator', 'username')
                .populate({
                    path: 'comments',
                    model: 'Comment',
                    select: 'content',
                    populate: {
                        path: 'client',
                        model: 'Client',
                        select: 'name',
                    },
                });

            return eventQuery;
        })
        .then((events) =>
        {
            res.status(200).json({ message: 'Fetched events successfully.', events: events });
        })
        .catch((err) =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};



exports.getsinglPost = async (req, res, next) =>
{
    try
    {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId)
            .populate('creator', ['username', 'imageUrl'])
            .populate({
                path: 'comments',
                model: 'Comment',
                select: 'content',
                populate: {
                    path: 'client',
                    model: 'Client',
                    select: ['name', 'imageUrl']
                },
            });

        if (!event)
        {
            const err = new Error('Event not found');
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({ message: 'Event fetched.', event: event });
    } catch (err)
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    }
};




exports.searchEvents = async (req, res, next) =>
{
    try
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            const error = new Error('Validation failed....');
            error.statusCode = 422;
            throw error;
        }

        const { city, username, date } = req.body;
        const searchCriteria = { status: 'accepted' };

        if (city) searchCriteria.city = city;

        if (username)
        {
            const owner = await Owner.findOne({ username: username });
            if (!owner)
            {
                const error = new Error('Owner not found');
                error.statusCode = 422;
                throw error;
            }
            searchCriteria.creator = owner._id;
        }

        if (date) searchCriteria.date = date;


        const events = await Event.find(searchCriteria)
            .populate('creator', ['username', 'imageUrl']);

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

const clearImage = filePath =>
{
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err => { if (err) { console.log(err) } }));
};
