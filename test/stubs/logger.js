'use strict';

const Proxyquire = require('proxyquire').noCallThru();
const Stubs      = require('./toki-logger');

class LoggerStub {

    constructor(options = {}) {

        const _stubs = Object.assign({},
            options.stubs || {},
            new Stubs.TokiLoggerProxy(options.spies)
        );

        return Proxyquire('../../lib/internals/logger', _stubs);
    }
}

class LoggerProxy {

    constructor(options = {}) {

        this[options.path] = new LoggerStub(options);
    }
}

module.exports = {
    LoggerStub,
    LoggerProxy
};
