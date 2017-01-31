'use strict';

const RouteHandler = require('./routeHandler');

module.exports = function(config) {

    const routes = [];

    config.routes.forEach((route) => {

        //instantiate router obj
        const handler = new RouteHandler(route);

        routes.push({
            url    : route.path,
            method : route.httpAction,
            handler: handler.handle
        });
    });

    return routes;
};
