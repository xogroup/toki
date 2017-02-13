'use strict';

const Proxyquire    = require('proxyquire').noCallThru();
const Logger        = require('./logger');
const Configuration = require('./configuration');
const RouteBuilder  = require('./routeBuilder');

class TokiStub {

    constructor(options) {

        let stubs = options.stubs || {};

        if (options.LoggerProxy) {
            stubs = Object.assign(
                stubs,
                new Logger.LoggerProxy(options.LoggerProxy)
            );
        }

        if (options.ConfigurationProxy) {
            stubs = Object.assign(
                stubs,
                new Configuration.ConfigurationProxy(options.ConfigurationProxy));
        }

        if (options.RouteBuilderProxy) {
            stubs = Object.assign(
                stubs,
                new RouteBuilder.RouteBuilderProxy(options.RouteBuilderProxy));
        }

        return Proxyquire('../../lib', stubs);
    }
}

module.exports = {
    TokiStub
};
