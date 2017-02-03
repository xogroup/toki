'use strict';

const EventEmitter = require('events');
const Internals    = require('./internals');

let _instance = null;

/*
 * Chronos router
 * */
class Chronos extends EventEmitter {

    /*
     * @param {Object} options - chronos configuration json
     *       router : router instance
     * */
    constructor(options) {

        if (_instance) {

            return _instance;
        }

        //switch to parent class
        super();

        //validate options
        this.options = new Internals.options(options).value;

        //setup configuration manager
        this._config = new Internals.configuration();
        this._config.on(Internals.configuration.constants.CONFIG_CHANGED_EVENT, () => {
            this._configurationChanged();
        });

        // //build routes
        // Internals.routesBuilder({
        //     routes: this.config.routes,
        //     server: options.server
        // });

        _instance = this;

        return _instance;
    }

    _initialize() {

    };

    /*
     * Handles chronos-core chnaged event
     * */
    _configurationChanged() {

        //bubble up event
        this.emit(Chronos.constants.CONFIG_CHANGED_EVENT);
    };

    /*
     * returns current chronos instance, if non existing throws error
     * */
    static getInstance() {

        if (!_instance) {

            throw new Error('Chronos needs to be created first via new Chronos(options)');
        }

        return _instance;
    }

    static get constants() {
        return {
            CONFIG_CHANGED_EVENT: 'config.changed',
            READY_EVENT         : 'ready',
        }
    }
}

module.exports = Chronos;
