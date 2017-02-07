'use strict';

const EventEmitter = require('events');
const Joi          = require('joi');
const Validate     = require('./validate');

/*
 * Interface to chronos-config module
 * */
class Configuration extends EventEmitter {

    constructor() {

        //switch to parent class
        super();

        //require configuration module
        this._configModule = require(Configuration.constants.CONFIG_MDDULE);

        //listen on changed event
        this._configModule.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

            this._configurationChanged();
        });
    }

    /*
     * Valid configuration schema
     * */
    static get _schema() {

        const action  = Joi.object().keys({
            name       : Joi.string(),
            type       : Joi.string(),
            description: Joi.string().optional()
        });
        const actions = Joi.array().items(action).min(2);
        const routes  = Joi.object().keys({
            path       : Joi.string(),
            httpAction : Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
            tags       : Joi.array().items(Joi.string()).min(1).optional(),
            description: Joi.string().optional(),
            actions    : Joi.array().items(action, actions).min(1)
        });

        return Joi.object().keys({
            routes: Joi.array().items(routes).min(1)
        }).label('chronos configuration');
    }

    static _validate(input) {

        return Validate(input, Configuration._schema);
    }

    /*
     * Returns current configuration
     * */
    get value() {

        return this._config;
    }

    /*
     * calls on chronos-config to obtain configuration
     * */
    getConfiguration() {

        return this._configModule.get()
        //validate configuration
            .then(Configuration._validate)
            .then((config) => {

                //capture valid config
                this._config = config;

                return this._config;
            });
    }

    /*
     * Handles chronos-core chnaged event
     * */
    _configurationChanged() {

        //bubble up event
        this.emit(Configuration.constants.CONFIG_CHANGED_EVENT);
    };

    static get constants() {

        return {
            CONFIG_MDDULE       : 'chronos-config',
            CONFIG_CHANGED_EVENT: 'config.changed'
        };
    }
}

module.exports = Configuration;
