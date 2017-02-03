'use strict';

const Joi      = require('joi');
const Validate = require('./validate');

/*
 * Validates chronos-core constructor options
 * */
class Options {

    constructor(input) {

        this._value = Options._validate(input);
    }

    /*
     * Valid configuration schema
     * */
    static get _schema() {
        return Joi.object().keys({
            router: Joi.object().keys({
                get   : Joi.func().arity(2),
                post  : Joi.func().arity(2),
                put   : Joi.func().arity(2),
                delete: Joi.func().arity(2),
                patch : Joi.func().arity(2)
            }).label('router object')
        }).label('options object');
    }

    static _validate(input) {

        return Validate(input, Options._schema);
    }

    get value() {

        return this._value;
    }
}

module.exports = Options;
