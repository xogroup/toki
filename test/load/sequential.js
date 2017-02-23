'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code    = require('code');
const expect  = Code.expect;
const Promise = require('bluebird');
const Stubs   = require('../stubs').Toki;

const targetRequest = 10000;
const targetTime    = 1000;

describe('sequential actions load tests', () => {

    let Toki;
    let router;

    const infoSpy  = (...args) => {

    };
    const debugSpy = (...args) => {

    };
    const errorSpy = (...args) => {

    };

    const load = [];

    let toki;
    let route1Handler;

    class TokiStub {

        constructor(options) {

            const _options = Object.assign(
                options || {},
                {
                    LoggerProxy: {
                        path : './internals/logger',
                        spies: {
                            infoSpy,
                            debugSpy,
                            errorSpy
                        }
                    }
                });

            return new Stubs.TokiStub(_options);

        }
    }

    beforeEach((done) => {

        const handler = (url, handlerFunc) => {
        };

        router = {
            get   : handler,
            post  : handler,
            put   : handler,
            delete: handler,
            patch : handler
        };

        router.get = function(url, handler1) {

            route1Handler = handler1;
        };

        const options     = {
            router
        };
        const config      = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET',
                    actions   : [
                        {
                            name: 'action1',
                            type: 'action-handler1'
                        },
                        {
                            name: 'action2',
                            type: 'action-handler2'
                        },
                        {
                            name: 'action3',
                            type: 'action-handler3'
                        }
                    ]
                }
            ]
        };
        const actionStubs = {
            'action-handler1': function(args) {

            },
            'action-handler2': function(args) {

            },
            'action-handler3': function(args) {

            }
        };
        const LoggerProxy = {
            path : './logger',
            spies: {
                infoSpy,
                debugSpy,
                errorSpy
            }
        };
        const stubs       = {
            ConfigurationProxy: {
                TokiConfigProxy: {
                    config
                },
                path           : './internals/configuration',
                LoggerProxy
            },
            RouteBuilderProxy : {
                path             : './internals/routeBuilder',
                RouteHandlerProxy: {
                    stubs: actionStubs,
                    path : './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki = new TokiStub(stubs);
        toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            return Promise.map(new Array(targetRequest),
                () => {

                    load.push({
                        handler : route1Handler,
                        response: { send: () => {} }
                    });
                })
                .then(() => {

                    done();
                });
        });
    });

    it('should handle ' + targetRequest + ' requests in ' + targetTime + ' ms',
        {
            timeout: targetTime
        },
        () => {

            return Promise.map(load, (item) => {

                return item.handler({}, item.response);
            });
        });
});
