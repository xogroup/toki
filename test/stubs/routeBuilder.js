'use strict';

const Proxyquire   = require('proxyquire').noCallThru();
const logger       = require('./logger');
const routeHandler = require('./routeHandler');

class RouteBuilderStub {

    constructor(options = {}) {

        const _options = Object.assign({},
            options.stubs || {},
            new routeHandler.RouteHandlerProxy(options.RouteHandlerProxy),
            new logger.LoggerProxy(options.LoggerProxy)
        );

        return Proxyquire('../../lib/internals/routeBuilder', _options);
    }
}

class RouteBuilderProxy {

    constructor(options) {

        this[options.path] = new RouteBuilderStub(options);
    }
}

module.exports = {
    RouteBuilderStub,
    RouteBuilderProxy
};
