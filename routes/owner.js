const express = require('express');

const { body } = require('express-validator');
const isAuth = require('../middleware/isAuth')

const ownerController = require('../controllers/owner')
const eventController = require('../controllers/event')


const router = express.Router();


router.post('/signup', [
    body('email').isEmail().trim().not().isEmpty(),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().not().isEmpty(),
    body('address').trim().not().isEmpty(),
    body('phone').trim().not().isEmpty(),

], ownerController.signup);


// router.post('/login', ownerController.login);



router.get('/acceptedevents', isAuth, eventController.getacceptedEvents);
router.get('/pendingevents', isAuth, eventController.getpendingEvents);
router.get('/cancelledevents', isAuth, eventController.getcancelledEvents);
router.get('/finishedevents', isAuth, eventController.getfinishedEvents);


router.post('/creatEvent', isAuth, eventController.creatEvent);
router.put('/updateEvent', isAuth, eventController.updateEvent);

router.put('/edit_profile', isAuth, ownerController.edit_profile);
router.get('/get_profile', isAuth, ownerController.get_profile);






module.exports = router;