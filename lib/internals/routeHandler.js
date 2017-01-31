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
            config  : this.config,
            request : request,
            response: response
        };

        return Promise.resolve()
            .bind(context)
            .then(actionsHandler);
    }
}

/*
 * Execute 1st level of actions sequentially
 * */
const actionsHandler = function() {

    //Create sequential promises
    return Promise.mapSeries(this.config.actions, (action) => {

        //action context
        const context = {
            config  : action,
            request : this.request,
            response: this.response
        };

        return Promise.resolve()
            .bind(context)
            .then(actionHandler);
    });
};

/*
 *
 * */
const parallelActionHandler = function() {

    return Promise.map(this.config,
        function(action) {
            //build action context
            const context = {
                server  : self.server,
                request : self.request,
                response: self.response,
                args    : self.args,
                //current executing action
                action  : action
            };

            //call actionHandler
            return Promise.resolve()
                .bind(context)
                .then(actionHandler);
        })
        .then(function() {
            //Promise.all returns original array, which there's no need in this case
        });
};

/*
 * action handler
 * */
const actionHandler = function() {

    //is it parallel actions
    if (Array.isArray(this.config)) {
        //exec parallel
        return parallelActionHandler.bind(this)();
    }

    //require handler to be called as per configuration type
    const handler = require(this.config.type);

    return Promise.resolve()
        .bind(this)
        .then(handler);
};

module.exports = RouteHandler;
