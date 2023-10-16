const express = require('express');
const { body } = require('express-validator');

const clinteController = require('../controllers/client')
const eventController = require('../controllers/event')



const isAuth = require('../middleware/isAuth')


const router = express.Router();


router.post('/signup', [
    body('email').isEmail().trim().not().isEmpty(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
    body('address').trim().not().isEmpty(),
    body('phone').trim().not().isEmpty(),
    body('age').trim().not().isEmpty(),

], clinteController.signup);


// router.post('/login', clinteController.login);

router.post('/booking', isAuth, eventController.booking);
router.post('/searchEvents', eventController.searchEvents);

// router.post('/search_by_owner', eventController.search_by_owner);
// router.post('/search_by_city', eventController.search_by_city);
// router.post('/search_by_date', eventController.search_by_date);


router.put('/add_comment', isAuth, clinteController.addComment);

router.put('/edit_profile', isAuth, clinteController.edit_profile);

// router.post('/get_comment', clinteController.get_comments);

router.get('/bookedevents', isAuth, eventController.getacceptedEvents);

router.get('/get_profile', isAuth, clinteController.get_profile);

router.get('/finishedevents', isAuth, eventController.getfinishedEvents);

router.get('/acceptedevents', isAuth, clinteController.getacceptedEvents);








module.exports = router;