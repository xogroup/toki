'use strict';

class InvalidRouteHttpAction extends Error {

    constructor(httpAction) {

        super('Unable to route unknown httpAction' + httpAction);
        this.name = 'InvalidRouteHttpAction';
    }
}

module.exports = InvalidRouteHttpAction;
