'use strict';

const Proxyquire    = require('proxyquire').noCallThru();
const logger        = require('./logger');
const configuration = require('./configuration');
const routeBuilder  = require('./routeBuilder');

class TokiStub {

    constructor(options) {

        let stubs = options.stubs || {};

        if (options.LoggerProxy) {
            stubs = Object.assign(
                stubs,
                new logger.LoggerProxy(options.LoggerProxy)
            );
        }

        if (options.ConfigurationProxy) {
            stubs = Object.assign(
                stubs,
                new configuration.ConfigurationProxy(options.ConfigurationProxy));
        }

        if (options.RouteBuilderProxy) {
            stubs = Object.assign(
                stubs,
                new routeBuilder.RouteBuilderProxy(options.RouteBuilderProxy));
        }

        return Proxyquire('../../lib', stubs);
    }
}

module.exports = {
    TokiStub
};
