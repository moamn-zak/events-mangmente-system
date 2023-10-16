const express = require('express');

const { body } = require('express-validator');
const isAuth = require('../middleware/isAuth');

const ownerController = require('../controllers/owner');
const eventController = require('../controllers/event');
const adminController = require('../controllers/admin');



const router = express.Router();


router.post('/addAdmin', adminController.addAdmin);
router.post('/login', adminController.login);


router.put('/activate_owner_account', isAuth, adminController.activate_owner_account);
router.get('/get_inactive_owner/:status', adminController.get_inactive_owner);
router.post('/add_city', isAuth, adminController.addCity);
router.delete('/delete_city', isAuth, adminController.deleteCity);

router.get('/get_city', adminController.getCity);

router.put('/edit_profile', isAuth, adminController.edit_profile);
router.get('/get_profile', isAuth, adminController.get_profile);

router.get('/acceptedevents', eventController.getacceptedEvents);
router.get('/pendingevents', eventController.getpendingEvents);
router.get('/cancelledevents', eventController.getcancelledEvents);
router.get('/finishedevents', eventController.getfinishedEvents);


router.put('/accept_cancel_event', isAuth, adminController.accept_cancel_Event);








module.exports = router;