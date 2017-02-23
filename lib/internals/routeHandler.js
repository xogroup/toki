'use strict';

const Promise = require('bluebird');
const Boom    = require('boom');
const Logger  = require('./logger');

/*
 * Route handler
 * */
class RouteHandler {

    /*
     * @param {Object} config - route configuration json
     * */
    constructor(config) {

        this.config = config;
        this.contexts = {

        };

        Logger.Instance.debug('Route handler initialized', config);
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

        Logger.Instance.debug('Route handler starting', this);

        return Promise.resolve()
            .bind(this)
            .then(() => {

                return this.config.actions;
            })
            .then(this.actionsHandler)
            .then(() => {

                Logger.Instance.debug('Route handler finished', this);

            })
            .catch((error) => {

                Logger.Instance.error('Route handler errored', this, error);
                response(Boom.badImplementation());
            });
    }

    actionsHandler(actions) {

        //Create sequential action handlers
        return Promise.mapSeries(actions, (action) => {

            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return action;
                })
                .then(this.actionHandler);
        });
    }

    /*
     * Execute individual action
     * */
    actionHandler(action) {

        //is it parallel actions
        if (Array.isArray(action)) {
            //exec parallel
            return this.parallelActionHandler.bind(this)(action);
        }

        Logger.Instance.debug('Route handler action starting', action, this);

        //require handler to be called as per configuration type
        const handler = require(action.type);

        this.contexts[action.name] = {
            server  : this.server,
            config  : action,
            contexts: this.contexts
        };

        return Promise.resolve()
            .bind(this.contexts[action.name])
            .then(() => {

                return {
                    action,
                    request : this.server.request,
                    response: this.server.response
                };
            })
            .then(handler)
            .then((output) => {

                //merge action output to main context
                this.contexts[action.name].output = output;

                Logger.Instance.debug('Route handler action finished', action, this);
            });
    };

    /*
     * Execute parallel actions
     * */
    parallelActionHandler(actions) {

        return Promise.map(actions, (action) => {

            //call actionHandler
            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return action;
                })
                .then(this.actionHandler);
        })
            .then(() => {
                //Promise.all returns original array, which there's no need in this case
            });
    }
}

module.exports = RouteHandler;
