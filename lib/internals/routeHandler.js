'use strict';

const Promise = require('bluebird');

/*
 * Route handler
 * */
class RouteHandler {

    /*
     * @param {Object} config - route configuration json
     * */
    constructor(config) {

        this.config = config;
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
            request : request,
            response: response
        };

        return Promise.resolve()
            .bind(context)
            .then(() => {
                return this.config.actions;
            })
            .then(RouteHandler.actionsHandler)
            .then(function() {

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
                .then(RouteHandler.actionHandler)
                .then(function() {

                });
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

        //require handler to be called as per configuration type
        const handler = require(action.type);

        return Promise.resolve()
            .bind(this)
            .then(() => {
                return {
                    action  : action,
                    request : this.request,
                    response: this.response
                };
            })
            .then(handler)
            .then(function(output) {
                //merge action output to main context
                this[action.name] = output;
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
            .then(function() {
                //Promise.all returns original array, which there's no need in this case
            });
    }
}

module.exports = RouteHandler;
