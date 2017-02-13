'use strict';

const Proxyquire = require('proxyquire').noCallThru();
const TokiConfig = require('./toki-config');
const Logger     = require('./logger');

class ConfigurationStub {

    constructor(options = {}) {

        const proxy = new TokiConfig.TokiConfigProxy(options.TokiConfigProxy);

        const stubs = Object.assign(
            options.stubs || {},
            proxy,
            new Logger.LoggerProxy(options.LoggerProxy)
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
