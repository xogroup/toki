'use strict';

const Promise = require('bluebird');
const Boom    = require('boom');

/*
 * Route handler
 * */
class RouteHandler {

    /*
     * @param {Object} config - route configuration json
     * */
    constructor(config) {

        this.config = config;

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

        return Promise.resolve()
            .bind(context)
            .then(() => {

                return this.config.actions;
            })
            .then(RouteHandler.actionsHandler)
            .catch((error) => {

                console.log(error);
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
