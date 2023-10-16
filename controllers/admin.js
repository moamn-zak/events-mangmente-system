const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Client = require('../models/client');
const Owner = require('../models/owner');
const Event = require('../models/event');
const Admin = require('../models/admin');
const City = require('../models/city');










exports.addAdmin = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }


    const email = req.body.email;//|| 'adminmoamn@event.com'
    const password = req.body.password;// || 'moamn';
    const name = req.body.name; //|| 'moamn';
    Admin.findOne({ email: email })
        .then(admin =>
        {
            if (admin)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }

            return bcrypt.hash(password, 12)
        })
        .then(hashpd =>
        {
            const admin = new Admin({
                email: email,
                password: hashpd,
                name: name
            });
            return admin.save();
        })
        .then(resu =>
        {
            res.status(201).json({ message: 'User created succsasfuly', user: resu })
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

exports.login = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    Admin.findOne({ email: email })
        .then(admin =>
        {
            if (!admin)
            {
                const error = new Error('A user with this Email could not be found');
                error.statusCode = 401;
                throw error;
            }
            // console.log(client);
            loadedUser = admin;
            return bcrypt.compare(password, admin.password);


        }).then(isEqule =>
        {

            if (!isEqule)
            {
                const error = new Error('Wronge password!');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
                name: loadedUser.name
            }, 'hi', { expiresIn: '30d' })//, { expiresIn: '30d' }
            res.status(200)
                .json({ message: 'loged in', token: token, type: 'admin', admin: loadedUser })
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

exports.addCity = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    const city_name = req.body.city;
    const city = new City({
        city_name: city_name
    });
    City.findOne({ city_name: city_name })
        .then(cit =>
        {


            if (cit)
            {
                const error = new Error('city is already exist.');
                error.statusCode = 422;
                throw error;
            }
            return city.save();
        }).then(resu =>
        {
            res.status(200).json({ message: 'city added ', city: resu.city_name })
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteCity = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    // const cityId = req.params.cityId;

    const cityId = req.body.cityId;
    City.findById(cityId).then(city =>
    {
        if (!city)
        {
            const error = new Error('city not found.');
            error.statusCode = 422;
            throw error;
        }
        return City.findOneAndRemove(city)
    }).then(resu =>
    {
        res.status(200).json({ message: 'city deleted ' })
    }).catch(err =>
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    });
};


exports.getCity = (req, res, next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }

    City.find()
        .then(city =>
        {


            if (!city)
            {
                const error = new Error('no cities found.');
                error.statusCode = 422;
                throw error;
            }

            return City.find()
        }).then(resu =>
        {

            res.status(200).json({ message: 'city fatched', city: resu })
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};


exports.accept_cancel_Event = (req, res, next) =>
{
    // const eventId = req.params.eventId;

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Entered data is incorrect...');
        error.statusCode = 422;
        throw error;
    }

    const eventId = req.body.eventId;
    const status = req.body.status;

    Event.findById(eventId)
        .then(event =>
        {

            if (!event)
            {
                const error = new Error('Could not find event.');
                error.statusCode = 404;
                throw error;
            }
            //add admin id..........
            if ('6509cdfaec6e6f9ff56b0387' !== req.userId)
            {
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }
            event.status = status;
            return event.save();
        })
        .then(result =>
        {
            res.status(200).json({ message: 'Event updated.', event: result });
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};



exports.get_inactive_owner = (req, res, next) =>
{
    const status = req.params.status;

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('Validation failed....');
        error.statusCode = 422;
        throw error;
    }
    let totalaccount;
    Owner.find().countDocuments()
        .then(count =>
        {
            totalaccount = count;
            return Owner.find({ status: status })
        })
        .then(accounts =>
        {
            res.status(200).json({ message: 'Fetched successfully.', accounts: accounts });
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};









exports.activate_owner_account = (req, res, next) =>
{
    // const ownerId = req.params.ownerId;

    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        const error = new Error('something wronge with requset...');
        error.statusCode = 422;
        throw error;
    }
    const ownerId = req.body.ownerId;
    const status = req.body.status;
    console.log(ownerId);

    Owner.findById(ownerId)
        .then(account =>
        {

            if (!account)
            {
                const error = new Error('Could not find account.');
                error.statusCode = 404;
                throw error;
            }
            if ('6509cdfaec6e6f9ff56b0387' !== req.userId)
            {
                const error = new Error('Not authorized.');
                error.statusCode = 403;
                throw error;
            }
            account.status = status;
            return account.save();
        })
        .then(result =>
        {
            res.status(200).json({ message: 'account updated.', owner: result });
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.get_profile = (req, res, next) =>
{
    const adminId = req.userId;
    Admin.findById(adminId).then(admin =>
    {
        if (!admin)
        {
            const err = new Error('admin not found');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({ message: 'admin fatched.', admin: admin });

    }).catch(err =>
    {
        if (!err.statusCode)
        {
            err.statusCode = 500;
        }
        next(err);
    });

};
exports.edit_profile = (req, res, next) =>
{
    const adminId = req.userId;
    const email = req.body.email;
    const name = req.body.name;

    Admin.findOne({ email: email })
        .then(admin =>
        {
            if (admin)
            {
                const error = new Error('this Email already exist');
                error.statusCode = 401;
                throw error;
            }
            return Admin.findById(adminId)
        })

        .then(admin =>
        {
            if (!admin)
            {
                const err = new Error('admin not found');
                err.statusCode = 404;
                throw err;
            }

            admin.email = email;
            admin.name = name;

            return Admin.save();
        }).then(result =>
        {
            res.status(200).json({ message: 'profile updated.', Admin: result });
        }).catch(err =>
        {
            if (!err.statusCode)
            {
                err.statusCode = 500;
            }
            next(err);
        });
};