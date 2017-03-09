'use strict';

const Proxyquire = require('proxyquire').noCallThru();
const Logger     = require('./toki-logger');

class RouteHandlerStub {

    constructor(options = {}) {

        const _options = Object.assign({},
            options.stubs || {},
            Logger(options.LoggerProxy));

        return Proxyquire('../../lib/internals/routeHandler', _options);
    }
}

class RouteHandlerProxy {

    constructor(options) {

        this[options.path] = new RouteHandlerStub(options);
    }
}

module.exports = {
    RouteHandlerStub,
    RouteHandlerProxy
};
