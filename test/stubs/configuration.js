'use strict';

const Proxyquire = require('proxyquire').noCallThru();
const tokiConfig = require('./toki-config');
const logger     = require('./logger');

class ConfigurationStub {

    constructor(options = {}) {

        const proxy = new tokiConfig.TokiConfigProxy(options.TokiConfigProxy);

        const stubs = Object.assign(
            options.stubs || {},
            proxy,
            new logger.LoggerProxy(options.LoggerProxy)
        );

        return Object.assign(
            Proxyquire('../../lib/internals/configuration', stubs), {
                tokiConfig: proxy.stub
            });
    }
}

class ConfigurationProxy {

    constructor(options) {

        this[options.path] = this.stub = new ConfigurationStub(options);
    }
}

module.exports = {
    ConfigurationStub,
    ConfigurationProxy
};
