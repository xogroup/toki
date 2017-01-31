'use strict';

const Internals = require('./internals');

/*
 * Chronos router
 * */
class Chronos {

    /*
     * @param {Object} options - chronos configuration json
     *       config : module name to be required and called to get configuration
     *       server :
     * */
    constructor(options) {

        //validate options
        this.options = Internals.configuration.validateOptions(options);

        //get configuration module
        this.plugins = {
            config: require(this.options.config)
        };

        //read and validate configuration
        this.config = Internals.configuration.validateConfiguration(this.plugins.config());

        //build routes
        this.options.server = Internals.routesBuilder(this.config);
    };
}

module.exports = Chronos;
