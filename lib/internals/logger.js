'use strict';

let $ = null;

class Logger {

    constructor() {

        if (!$) {
            const TokiLogger = require(Logger.constants.LOGGER_MODULE);

            $ = TokiLogger();
        }

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
