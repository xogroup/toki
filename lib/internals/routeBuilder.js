'use strict';

const Logger       = require('./logger');
const RouteHandler = require('./routeHandler');

class RouteBuilder {

    /*
     * Sets routes on server instance based on configuration
     * @param {Object} input
     *       routes - configuration routes
     *       router - router server to populate
     * */
    static build(input) {

        const router = input.router;
        const logger = Logger.Instance;

        logger.debug('Route setup started');

        input.routes.forEach((route) => {

            //instantiate router obj
            logger.debug('Setup route ' + route.httpAction + ' ' + route.path);

            router.route({
                method: route.httpAction,
                path: route.path,
                handler: new RouteHandler(route)
            });
        });

        logger.debug('Route setup finished');
    }
}

module.exports = RouteBuilder;
