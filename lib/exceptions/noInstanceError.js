'use strict';

class NoInstanceError extends Error {

    constructor() {

        super('Toki needs to be created first via new Toki(options) before calling Toki.getInstance');
        this.name = 'NoInstanceError';
    }
}

module.exports = NoInstanceError;
