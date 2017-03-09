'use strict';

class TokiLoggerStub {

    constructor(spies = {}) {

        this.spies = spies;
    }

    info(...args) {

        this.spies.infoSpy();
        this.log(args);
    }

    debug(...args) {

        this.spies.debugSpy();
        this.log(args);
    }

    error(...args) {

        this.spies.errorSpy();
        this.log(args);
    }

    log(...args) {

        if (process.env.CONSOLE_DEBUG) {

            console.log(args);
        }
    }
}

module.exports = function (options) {

    return { 'toki-logger': () => new TokiLoggerStub(options.spies) };
};
