'use strict';

const EventEmitter  = require('events');
const Options       = require('./internals/options');
let Configuration = null;
let RouteBuilder  = null;

let instance = null;

const EVENTS = {
    CONFIG_CHANGED : 'config.changed',
    READY          : 'ready',
    ERROR          : 'error'
};

/*
 * Toki
 * */
class Toki extends EventEmitter {

    /*
     * @param {Object} options - toki configuration json
     *       router : router instance
     * */
    constructor(options) {

        if (instance) {
            return instance;
        }


        super();

        instance = this;

        //validate options
        this._options = new Options(options).value;

        const Logger = require('toki-logger');
        this.logger = Logger(this._options.logger);

        Configuration = require('./internals/configuration');
        RouteBuilder  = require('./internals/routeBuilder');

        //start initialization
        this._initialize();

        this.logger.info('New Toki instance created');

    }

    _initialize() {

        this.logger.debug('Toki started initialization');

        //setup configuration manager
        this._configuration = new Configuration(this._options.config);

        //listen on config.changed event
        this._configuration.on(EVENTS.CONFIG_CHANGED, () => {

            this._configurationChanged();
        });

        //EXPLICIT fire and forget
        this._configuration.loadConfiguration()
            .then((config) => {

                //store config in instance;
                this._config = config;

                //setup routes
                RouteBuilder.build({
                    routes: config.routes,
                    router: this._options.router
                });

                //emit ready event
                this.logger.info('Toki in ready state');
                this.emit(EVENTS.READY);
            })
            .catch((error) => {

                //bubble up error
                this.emit(EVENTS.ERROR, error);
                this.logger.error('Toki errored during initalization', error);
            });
    };

    /*
     * Handles changed event
     * */
    _configurationChanged() {

        //bubble up event
        this.emit(EVENTS.CONFIG_CHANGED);
        this.logger.info('Toki configuration changed');
    };
}

module.exports = Toki;
