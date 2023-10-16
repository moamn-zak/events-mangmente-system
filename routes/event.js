const express = require('express');
const isAuth = require('../middleware/isAuth')
const router = express.Router();



const ownerController = require('../controllers/owner')


const eventController = require('../controllers/event')




router.get('/events', eventController.getacceptedEvents);
router.get('/getsinglPost/:eventId', eventController.getsinglPost);

// router.post('/booking', isAuth, eventController.booking);



router.post('/login', ownerController.login);








module.exports = router;