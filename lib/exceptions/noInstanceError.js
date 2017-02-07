'use strict';

class NoInstanceError extends Error {

    constructor() {

        super('Chronos needs to be created first via new Chronos(options) before calling Chronos.getInstance');
        this.name = 'NoInstanceError';
    }
}

module.exports = NoInstanceError;
