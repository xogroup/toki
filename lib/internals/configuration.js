'use strict';

const EventEmitter = require('events');
const Joi          = require('joi');
const Validate     = require('./validate');
const Logger       = require('./logger');

/*
 * Interface to toki-config module
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
        Logger.Instance.debug('New Toki Configuration instance');
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
        }).label('toki configuration');
    }

    static _validate(input) {

        Logger.Instance.debug(Configuration.constants.CONFIG_MDDULE + ' returned', input);

        return Validate(input, Configuration._schema);
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
    getConfiguration() {

        Logger.Instance.debug('Calling ' + Configuration.constants.CONFIG_MDDULE);

        return this._configModule.get()
        //validate configuration
            .then(Configuration._validate)
            .then((config) => {

                //capture valid config
                this._config = config;

                Logger.Instance.debug(Configuration.constants.CONFIG_MDDULE + ' validated', config);

                return this._config;
            });
    }

    /*
     * Handles toki-config chnaged event
     * */
    _configurationChanged() {

        //bubble up event
        const event = Configuration.constants.CONFIG_CHANGED_EVENT;
        this.emit(event);
        Logger.Instance.debug(Configuration.constants.CONFIG_MDDULE + ' fired ' + event);
    };

    static get constants() {

        return {
            CONFIG_MDDULE       : '@toki/toki-config',
            CONFIG_CHANGED_EVENT: 'config.changed'
        };
    }
}

module.exports = Configuration;
