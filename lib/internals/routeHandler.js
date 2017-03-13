'use strict';

const Promise = require('bluebird');
const Boom    = require('boom');
const Logger  = require('toki-logger')();

/*
 * Route handler
 * */
class RouteHandler {

    /*
     * @param {Object} config - route configuration json
     * */
    constructor(config, options = {}) {

        this.config = config;
        this.options = options;

        this.Promise = this.options.promise || Promise;
        this.Logger = Logger;

        this.contexts = {

        };

        Logger.debug('Route handler initialized', config);
        return this.handle.bind(this);
    }

    /*
     * Route handler
     *
     * Returns promise or callback if provided
     *
     * @param {Object} request   - request object
     * @param {Object} response  - response object
     * */
    handle(request, response) {

        //create bounde context
        this.server = {
            request,
            response
        };

        const defaultErrorHandler = function (err) {

            Logger.error('Route handler errored', this, err);
            return response.send(Boom.badImplementation());
        };

        Logger.debug('Route handler starting', this);

        return Promise.resolve()
            .bind(this)
            .then(() => {

                return this.config.actions;
            })
            .then(this.actionsHandler)
            .then(() => {

                Logger.debug('Route handler finished', this);
                response.end();
            })
            .catch((error) => {

                if (this.config.failure) {
                    return this.actionsHandler.call(this, this.config.failure, error)
                        .catch(defaultErrorHandler);
                }

                return defaultErrorHandler(error);
            });
    }

    actionsHandler(actions, ...errors) {

        //Create sequential action handlers
        return Promise.mapSeries(actions, (action) => {

            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return this.actionHandler.call(this, action, errors);
                });
        });
    }

    /*
     * Execute individual action
     * */
    actionHandler(action, errors) {

        //is it parallel actions
        if (Array.isArray(action)) {
            //exec parallel
            return this.parallelActionHandler.call(this, action, errors);
        }

        Logger.debug('Route handler action starting', action, this);

        //require handler to be called as per configuration type
        const handler = require(action.type);

        this.contexts[action.name] = {
            server  : this.server,
            Promise : this.Promise,
            Logger,
            config  : action,
            contexts: this.contexts
        };

        return Promise.resolve()
            .bind(this.contexts[action.name])
            .then(() => {

                return {
                    action,
                    request : this.server.request,
                    response: this.server.response,
                    errors
                };
            })
            .then(handler)
            .then((output) => {

                //merge action output to main context
                this.contexts[action.name].output = output;

                Logger.debug('Route handler action finished', action, this);
            });
    };

    /*
     * Execute parallel actions
     * */
    parallelActionHandler(actions, errors) {

        return Promise.map(actions, (action) => {

            //call actionHandler
            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return this.actionHandler.call(this, action, errors);
                });
        })
            .then(() => {
                //Promise.all returns original array, which there's no need in this case
            });
    }
}

module.exports = RouteHandler;
