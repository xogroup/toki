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
        const context = {
            request,
            response
        };

        Logger.Instance.debug('Route handler starting', context);

        return Promise.resolve()
            .bind(context)
            .then(() => {

                return this.config.actions;
            })
            .then(RouteHandler.actionsHandler)
            .then(() => {
                Logger.Instance.debug('Route handler finished', context);

            })
            .catch((error) => {

                Logger.Instance.debug('Route handler errored', context, error);
                response(Boom.badImplementation());
            });
    }

    static actionsHandler(actions) {

        //Create sequential action handlers
        return Promise.mapSeries(actions, (action) => {

            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return action;
                })
                .then(RouteHandler.actionHandler);
        });
    }

    /*
     * Execute individual action
     * */
    static actionHandler(action) {

        //is it parallel actions
        if (Array.isArray(action)) {
            //exec parallel
            return RouteHandler.parallelActionHandler.bind(this)(action);
        }

        Logger.Instance.debug('Route handler action starting', action, this);

        //require handler to be called as per configuration type
        const handler = require(action.type);

        return Promise.resolve()
            .bind(this)
            .then(() => {

                return {
                    action,
                    request : this.request,
                    response: this.response
                };
            })
            .then(handler)
            .then((output) => {

                //merge action output to main context
                this[action.name] = output;

                Logger.Instance.debug('Route handler action finished', action, this);
            });
    };

    /*
     * Execute parallel actions
     * */
    static parallelActionHandler(actions) {

        return Promise.map(actions, (action) => {

            //call actionHandler
            return Promise.resolve()
                .bind(this)
                .then(() => {

                    return action;
                })
                .then(RouteHandler.actionHandler);
        })
            .then(() => {
                //Promise.all returns original array, which there's no need in this case
            });
    }
}

module.exports = RouteHandler;
