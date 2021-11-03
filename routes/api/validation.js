const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { ValidInfoContact } = require('../../config/constant');

const schemaContact = Joi.object({
  name: Joi.string()
    .min(ValidInfoContact.MIN_SYMBOLS)
    .max(ValidInfoContact.MAX_SYMBOLS)
    .required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean().optional(),
});

const schemaStatusContact = Joi.object({
  favorite: Joi.boolean().required(),
});

const schemaId = Joi.object({
  contactId: Joi.objectId().required(),
});

const validate = async (schema, obj, res, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (error) {
    res.status(400).json({
      status: 'error',
      code: 400,
      message: `Field ${error.message.replace(/"/g, '')}`,
    });
  }
};

module.exports.validateContact = async (req, res, next) => {
  return await validate(schemaContact, req.body, res, next);
};

module.exports.validateStatusContact = async (req, res, next) => {
  return await validate(schemaStatusContact, req.body, res, next);
};

module.exports.validateId = async (req, res, next) => {
  return await validate(schemaId, req.params, res, next);
};
