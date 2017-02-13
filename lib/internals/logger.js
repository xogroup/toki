'use strict';

let $ = null;

class Logger {

    constructor() {

        if ($) {

            return $;
        }

        $ = require(Logger.constants.LOGGER_MODULE);

        return $;
    };

    static get constants() {

        return {
            LOGGER_MODULE: 'toki-logger'
        };
    }

    static get Instance() {

        return new Logger();
    };
}

module.exports = Logger;
