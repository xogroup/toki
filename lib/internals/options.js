'use strict';

const Joi      = require('joi');

const optionsSchema = Joi.object().keys({
    router: Joi.object().keys({
        route: Joi.func().required()
    }).required().label('bridge router object'),
    promise: Joi.any().label('promise implementation'),
    config: Joi.object().optional().label('configuration values for toki-config'),
    logger: Joi.any().label('logger to wrap')
}).required().label('options object');

/*
 * Validates toki constructor options
 * */
class Options {

    constructor(input) {

        this._value = input;
        const validated = Joi.validate(input, optionsSchema, { allowUnknown: true });
        if (validated.error) {
            throw validated.error;
        }
    }


    get value() {

        return this._value;
    }
}

module.exports = Options;
