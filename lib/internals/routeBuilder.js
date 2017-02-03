'use strict';

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

        input.routes.forEach((route) => {

            //instantiate router obj
            const handler = new RouteHandler(route);

            let endpoint;

            if (route.httpAction == 'GET') {
                endpoint = router.get;
            } else if (route.httpAction == 'POST') {
                endpoint = router.post;
            } else if (route.httpAction == 'PUT') {
                endpoint = router.put;
            } else if (route.httpAction == 'DELETE') {
                endpoint = router.delete;
            } else if (route.httpAction == 'PATCH') {
                endpoint = router.patch;
            }

            endpoint(route.path, handler.handle);
        });
    }
}

module.exports = RouteBuilder;
