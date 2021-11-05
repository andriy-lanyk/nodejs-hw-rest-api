const express = require('express');
const router = express.Router();
const {
  registration,
  login,
  logout,
  currentUser,
  updateSubscription,
} = require('../../controllers/users');
const {
  validateUserLogin,
  validateUserRegistration,
  validateUserSubscription,
} = require('./validation');
const guard = require('../../helpers/guard');
const loginLimit = require('../../helpers/rate-limit-login');

router.post('/signup', validateUserRegistration, registration);

router.post('/login', loginLimit, validateUserLogin, login);

router.post('/logout', guard, logout);

router.get('/current', guard, currentUser);

router.patch(
  '/subscription',
  guard,
  validateUserSubscription,
  updateSubscription
);

module.exports = router;
