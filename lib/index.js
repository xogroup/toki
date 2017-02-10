'use strict';

const EventEmitter  = require('events');
const Exceptions    = require('./exceptions');
const Options       = require('./internals/options');
const Configuration = require('./internals/configuration');
const RouteBuilder  = require('./internals/routeBuilder');
const Logger        = require('./internals/logger');

let $ = null;

/*
 * Toki
 * */
class Toki extends EventEmitter {

    /*
     * @param {Object} options - toki configuration json
     *       router : router instance
     * */
    constructor(options) {

        if ($) {

            Logger.Instance.debug('Returns existing Toki instance');
            return $;
        }

        //switch to parent class
        super();

        $ = this;

        //validate options
        this._options = new Options(options).value;

        //start initialization
        this._initialize();

        Logger.Instance.info('New Toki instance created');
        return $;
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
                this.emit(Toki.constants.READY_EVENT);
                Logger.Instance.info('Toki in ready state');
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

    /*
     * returns current instance, if non existing throws error
     * */
    static getInstance() {

        if (!$) {
            Logger.Instance.error('Toki needs to be instantiated first');
            throw new Exceptions.NoInstanceError();
        }

        return $;
    }

    static get constants() {

        return {
            CONFIG_CHANGED_EVENT: 'config.changed',
            READY_EVENT         : 'ready',
            ERROR_EVENT         : 'error'
        };
    }
}

module.exports = Toki;
