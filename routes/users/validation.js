const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  HttpCode,
  Subscription,
  ValidInfoUser,
} = require('../../config/constants');

const schemaUserRegistration = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(ValidInfoUser.MIN_PASSWORD).required(),
  subscription: Joi.string()
    .valid(Subscription.START, Subscription.PRO, Subscription.BUSINESS)
    .optional(),
});

const schemaUserLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(ValidInfoUser.MIN_PASSWORD).required(),
});

const schemaUserSubscription = Joi.object({
  subscription: Joi.string()
    .valid(Subscription.START, Subscription.PRO, Subscription.BUSINESS)
    .required(),
});

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (err) {
    res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message: `Validation error: ${err.message}`,
    });
  }
};

module.exports.validateUserRegistration = async (req, res, next) => {
  return await validate(schemaUserRegistration, req.body, res, next);
};

module.exports.validateUserLogin = async (req, res, next) => {
  return await validate(schemaUserLogin, req.body, res, next);
};

module.exports.validateUserSubscription = async (req, res, next) => {
  return await validate(schemaUserSubscription, req.body, res, next);
};
