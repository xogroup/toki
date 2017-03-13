'use strict';

const EventEmitter = require('events');
const Joi          = require('joi');
const Logger       = require('toki-logger')();
const TokiConfig   = require('toki-config');

const EVENTS = {
    CONFIG_CHANGED: 'config.changed'
};

const actionSchema  = Joi.object().keys({
    name       : Joi.string(),
    type       : Joi.string(),
    description: Joi.string().optional().allow(null, ''),
    options    : Joi.object().optional().allow(null)
});

const configSchema  = Joi.object().keys({
    routes: Joi.array().items(
        Joi.object().keys({
            path       : Joi.string(),
            httpAction : Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
            tags       : Joi.array().items(Joi.string()).min(1).optional(),
            description: Joi.string().optional().allow(null, ''),
            actions    : Joi.array().items(actionSchema, Joi.array().items(actionSchema).min(2) ).min(1),
            failure    : Joi.array().items(actionSchema, Joi.array().items(actionSchema).min(2) ).min(1).optional()
        })
    ).min(1)
}).label('toki configuration');


/*
 * Interface to toki-config module
 * */
class Configuration extends EventEmitter {

    constructor(options) {

        //construct parent class
        super();

        //patch our emit so we log every emit
        this._emit = this.emit;
        this.emit = (...args) => {

            Logger.debug(`Emitting ${args[0]}`);
            return this._emit(...args);
        };

        //require configuration module
        this.tokiConfig  = new TokiConfig(options);

        //listen on changed event
        this.tokiConfig.on(EVENTS.CONFIG_CHANGED, () => {

            this.emit(EVENTS.CONFIG_CHANGED);
        });

        Logger.debug('New Toki Configuration instance');
    }

    static _validate(input) {

        const validated = Joi.validate(input, configSchema, {
            allowUnknown : true,
            presence    : 'required'
        });

        if (validated.error) {
            throw validated.error;
        }

        return validated.value;
    }

    /*
     * Returns current configuration
     * */
    get value() {

        return this._config;
    }

    /*
     * calls on toki-config to obtain configuration
     * */
    loadConfiguration() {

        Logger.debug('Calling toki config');

        return this.tokiConfig.get()
        //validate configuration
            .then(Configuration._validate)
            .then((config) => {

                //capture valid config
                this._config = config;

                Logger.debug('Config validated', config);

                return this._config;
            });
    }
}

module.exports = Configuration;
