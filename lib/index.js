'use strict';

const EventEmitter = require('events');
const Exceptions = require('./exceptions');

let $ = null;

/*
 * Chronos router
 * */
class Chronos extends EventEmitter {

    /*
     * @param {Object} options - chronos configuration json
     *       router : router instance
     * */
    constructor(options) {

        if ($) {

            return $;
        }

        //switch to parent class
        super();

        //validate options
        const Options = require('./internals/options');
        this._options = new Options(options).value;

        this._initialize();

        $ = this;

        return $;
    }

    _initialize() {

        //setup configuration manager
        //NOTE: require this way to support proxyquire
        const Configuration = require('./internals/configuration');
        this._configuration = new Configuration();

        this._configuration.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

            this._configurationChanged();
        });

        //EXPLICIT fire and forget
        this._configuration.getConfiguration()
            .then((config) => {

                //store config in instance;
                this._config = config;

                //setup routes
                //NOTE: require this way to support proxyquire
                const RouteBuilder = require('./internals/routeBuilder');
                RouteBuilder.build({
                    routes: config.routes,
                    router: this._options.router
                });

                //emit ready event
                this.emit(Chronos.constants.READY_EVENT);
            })
            .catch((error) => {

                //bubble up error
                this.emit(Chronos.constants.ERROR_EVENT, error);
            });
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

        if (!$) {

            throw new Exceptions.NoInstanceError();
        }

        return $;
    }

    static get constants() {

        return {
            CONFIG_CHANGED_EVENT: 'config.changed',
            READY_EVENT         : 'ready',
            ERROR_EVENT         : 'error',
            LOG_INFO            : 'log.info',
            LOG_WARN            : 'log.warn',
            LOG_ERROR           : 'log.error',
            LOG_FATAL           : 'log.fatal',
            LOG_DEBUG           : 'log.debug'
        };
    }

    static log(level, obj) {

        const instance = getInstance();
        instance.emit(level, obj);
    }
}

module.exports = Chronos;
