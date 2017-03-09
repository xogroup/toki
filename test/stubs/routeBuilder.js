'use strict';

const Proxyquire   = require('proxyquire').noCallThru();
const Logger       = require('./toki-logger');
const RouteHandler = require('./routeHandler');

class RouteBuilderStub {

    constructor(options = {}) {

        const _options = Object.assign({},
            options.stubs || {},
            new RouteHandler.RouteHandlerProxy(options.RouteHandlerProxy),
            Logger(options.LoggerProxy)
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
