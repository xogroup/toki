'use strict';

const Exceptions   = require('../exceptions');
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
        // const logger = Logger.Instance;

        input.routes.forEach((route) => {

            let endpoint;

            if (route.httpAction === 'GET') {
                endpoint = router.get;
            }
            else if (route.httpAction === 'POST') {
                endpoint = router.post;
            }
            else if (route.httpAction === 'PUT') {
                endpoint = router.put;
            }
            else if (route.httpAction === 'DELETE') {
                endpoint = router.delete;
            }
            else if (route.httpAction === 'PATCH') {
                endpoint = router.patch;
            }

            if (!endpoint) {

                // logger.error('Invalid route action ' + route.httpAction);
                throw new Exceptions.InvalidRouteHttpAction(route.httpAction);
            }

            //instantiate router obj
            // logger.debug('Setup route ' + route.httpAction + ' ' + route.path);
            endpoint(route.path, new RouteHandler(route));
        });
    }
}

module.exports = RouteBuilder;
