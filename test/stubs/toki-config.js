'use strict';

const EventEmitter      = require('events');
const Promise           = require('bluebird');
const configurationPath = '../../lib/internals/configuration';
const tokiConfigName    = require(configurationPath).constants.CONFIG_MDDULE;

class TokiConfigStub extends EventEmitter {

    constructor(config) {

        super();

        this.config = config;
    }

    get() {

        return Promise.resolve(this.config);
    }
}

class TokiConfigProxy {

    constructor(config) {

        this[tokiConfigName] = new TokiConfigStub(config);
    }

    get stub() {

        return this[tokiConfigName];
    }
}

module.exports = {
    TokiConfigStub,
    TokiConfigProxy
};
