'use strict';

const EventEmitter  = require('events');
const Options       = require('./internals/options');
const Configuration = require('./internals/configuration');
const RouteBuilder  = require('./internals/routeBuilder');
const Logger        = require('./internals/logger');

let instance = null;

/*
 * Toki
 * */
class Toki extends EventEmitter {

    /*
     * @param {Object} options - toki configuration json
     *       router : router instance
     * */
    constructor(options) {

        if (!instance) {

            super();

            instance = this;

            //validate options
            this._options = new Options(options).value;

            //start initialization
            this._initialize();

            Logger.Instance.info('New Toki instance created');
        }
        else {

            Logger.Instance.debug('Return existing Toki instance');
        }

        return instance;
    }

    _initialize() {

        Logger.Instance.debug('Toki started initialization');

        //setup configuration manager
        this._configuration = new Configuration();

        //listen on config.changed event
        this._configuration.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

            this._configurationChanged();
        });

        //EXPLICIT fire and forget
        this._configuration.getConfiguration()
            .then((config) => {

                //store config in instance;
                this._config = config;

                //setup routes
                RouteBuilder.build({
                    routes: config.routes,
                    router: this._options.router
                });

                //emit ready event
                Logger.Instance.info('Toki in ready state');
                this.emit(Toki.constants.READY_EVENT);
            })
            .catch((error) => {

                //bubble up error
                this.emit(Toki.constants.ERROR_EVENT, error);
                Logger.Instance.error('Toki errored during initalization', error);
            });
    };

    /*
     * Handles changed event
     * */
    _configurationChanged() {

        //bubble up event
        this.emit(Toki.constants.CONFIG_CHANGED_EVENT);
        Logger.Instance.info('Toki configuration changed');
    };

    static get constants() {

        return {
            CONFIG_CHANGED_EVENT: 'config.changed',
            READY_EVENT         : 'ready',
            ERROR_EVENT         : 'error'
        };
    }
}

module.exports = Toki;
