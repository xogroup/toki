'use strict';

const Exceptions = require('../exceptions');

class RouteBuilder {

    /*
     * Sets routes on server instance based on configuration
     * @param {Object} input
     *       routes - configuration routes
     *       router - router server to populate
     * */
    static build(input) {

        const RouteHandler = require('./routeHandler');
        const router       = input.router;

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
                throw new Exceptions.InvalidRouteHttpAction(route.httpAction);
            }

            // /instantiate router obj
            endpoint(route.path, new RouteHandler(route));
        });
    }
}

module.exports = RouteBuilder;
