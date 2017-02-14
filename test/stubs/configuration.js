'use strict';

const Proxyquire = require('proxyquire').noCallThru();
const TokiConfig = require('./toki-config');
const Logger     = require('./logger');

class ConfigurationStub {

    constructor(options = {}) {

        let stubs = options.stubs || {};
        let tokiConfig;

        if (options.TokiConfigProxy) {

            tokiConfig = new TokiConfig.TokiConfigProxy(options.TokiConfigProxy.config);

            stubs = Object.assign(
                stubs,
                tokiConfig);
        }

        if (options.LoggerProxy) {
            stubs = Object.assign(
                stubs,
                new Logger.LoggerProxy(options.LoggerProxy)
            );
        }

        return Object.assign(
            Proxyquire('../../lib/internals/configuration', stubs), {
                tokiConfig
            });
    }
}

class ConfigurationProxy {

    constructor(options) {

        this[options.path] = this._stub = new ConfigurationStub(options);
    }

    get stub() {

        return this._stub;
    }
}

module.exports = {
    ConfigurationStub,
    ConfigurationProxy
};
