'use strict';

const EventEmitter      = require('events');
const Promise           = require('bluebird');

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

        this['toki-config'] = new TokiConfigInstance(config);
    }

    get stub() {

        return _instance;
    }
}

module.exports = {
    TokiConfigStub,
    TokiConfigProxy
};
