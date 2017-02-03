'use strict';

const Joi = require('joi');

module.exports = (input, schema) => {

    const result = Joi.validate(input, schema, {
        presence: 'required'
    });

    if (result.error) {
        throw result.error;
    }

    return result.value;
};
