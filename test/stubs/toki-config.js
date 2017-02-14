'use strict';

const EventEmitter      = require('events');
const Promise           = require('bluebird');
const configurationPath = '../../lib/internals/configuration';
const tokiConfigName    = require(configurationPath).constants.CONFIG_MDDULE;

let _config;
let _instance;

class TokiConfigStub extends EventEmitter {

    constructor() {

        super();

        _instance = this;
    }

    get() {

        return Promise.resolve(_config);
    }
}

class TokiConfigInstance {

    constructor(config) {

        _config = config;

        return TokiConfigStub;
    }
}

class TokiConfigProxy {

    constructor(config) {

        this[tokiConfigName] = new TokiConfigInstance(config);
    }

    get stub() {

        return _instance;
    }
}

module.exports = {
    TokiConfigStub,
    TokiConfigProxy
};
