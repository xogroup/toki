'use strict';

const Joi    = require('joi');
const config = {};

//chronos
const schemaOptions = Joi.object().keys({
    config: Joi.string().label('configuration module name')
}).label('options');

const action              = Joi.object().keys({
    name       : Joi.string(),
    type       : Joi.string(),
    description: Joi.string().optional()
});
const actions             = Joi.array().items(action).min(2);
const routes              = Joi.object().keys({
    path       : Joi.string(),
    httpAction : Joi.string().valid('GET', 'POST', 'PUT', 'DELETE'),
    tags       : Joi.array().items(Joi.string()).min(1).optional(),
    description: Joi.string().optional(),
    actions    : Joi.array().items(action, actions).min(1)
});
const schemaConfiguration = Joi.object().keys({
    routes: Joi.array().items(routes).min(1)
}).label('configuration');

config.validateOptions = (input) => {

    return config.validate(input, schemaOptions);
};

config.validateConfiguration = (input) => {

    return config.validate(input, schemaConfiguration);
};

config.validate = (input, schema) => {

    const result = Joi.validate(input, schema, {
        presence: 'required'
    });

    if (result.error) {
        throw result.error;
    }

    return result.value;
};

module.exports = config;
