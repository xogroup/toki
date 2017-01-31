'use strict';

// const Lab = require('lab');
// const lab = exports.lab = Lab.script();
// const describe = lab.describe;
// const it       = lab.it;

const Code       = require('code');
const expect     = Code.expect;
const Sinon      = require('sinon');
const Internals  = require('../lib/internals');
const Proxyquire = require('proxyquire').noCallThru();

describe.only('internals tests', () => {

    describe('options validation', () => {

        let validate;

        before(() => {

            validate = Internals.configuration.validateOptions;
        });

        it('should throw if no options supplied', () => {

            const options = undefined;
            expect(() => {

                return validate(options);
            }).to.throw('\"options\" is required');
        });

        it('should throw if options missing', () => {

            const options = {};
            expect(() => {

                return validate(options);
            }).to.throw('child "configuration module name" fails because ["configuration module name" is required]');
        });

        it('should throw if options empty', () => {

            const options = {
                config: ''
            };
            expect(() => {

                return validate(options);
            }).to.throw('child "configuration module name" fails because ["configuration module name" is not allowed to be empty]');
        });

        it('should pass options validation', () => {

            const options = {
                config: 'module-name'
            };
            expect(() => {

                return validate(options);
            }).to.not.throw();

            const result = validate(options);
            expect(result).to.be.an.object();
            expect(result.config).to.exist().and.be.an.string();
        });
    });

    describe('configuration validation', () => {

        let validate;

        before(() => {

            const configuration = Internals.configuration;
            validate            = configuration.validateConfiguration;
        });

        it('should throw if no configuration supplied', () => {

            const config = undefined;
            expect(() => {

                return validate(config);
            }).to.throw('\"configuration\" is required');
        });

        it('should throw if routes missing', () => {

            const config = {};
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" is required]');
        });

        it('should throw if route empty', () => {

            const config = {
                routes: []
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" must contain at least 1 items]');
        });

        it('should throw if route.path empty', () => {

            const config = {
                routes: [
                    {}
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "path" fails because ["path" is required]]]');
        });

        it('should throw if route.httpAction empty', () => {

            const config = {
                routes: [
                    {
                        path: 'path'
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "httpAction" fails because ["httpAction" is required]]]');
        });

        it('should throw if route.httpAction invalid', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'httpAction'
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "httpAction" fails because ["httpAction" must be one of [GET, POST, PUT, DELETE]]]]');
        });

        it('should throw if route.actions invalid', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : ''
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" must be an array]]]');
        });

        it('should throw if route.actions empty', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : []
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" must contain at least 1 items]]]');
        });

        it('should throw if route.actions.action invalid', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : [{}]
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.throw('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" at position 0 does not match any of the allowed types]]]');
        });

        it('should pass validation', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : [
                            {
                                name: 'name',
                                type: 'type'
                            }
                        ]
                    }
                ]
            };
            expect(() => {

                return validate(config);
            }).to.not.throw();

            const result = validate(config);
            expect(result).to.be.an.object();
            expect(result.routes).to.exist().and.be.an.array();
        });
    });

    describe('rotues builder', () => {

        let builder;

        before(() => {

            builder = Internals.routesBuilder;
        });

        it('should return routes', () => {

            const config = {
                routes: [
                    {
                        path      : 'route1',
                        httpAction: 'GET'
                    },
                    {
                        path      : 'route2',
                        httpAction: 'POST'
                    }
                ]
            };

            const routes = builder(config);

            expect(routes).to.be.an.array();
            expect(routes.length).to.equal(config.routes.length);

            [0, 1].forEach((i) => {
                expect(routes[i]).to.be.an.object();
                expect(routes[i].url).to.be.an.string().and.equal(config.routes[i].path);
                expect(routes[i].method).to.be.an.string().and.equal(config.routes[i].httpAction);
                expect(routes[i].handler).to.be.a.function();
            });
        });
    });

    describe('route handler', () => {

        let RouteHandler;
        const response = Sinon.spy();

        beforeEach(() => {

            response.reset();

            RouteHandler = Proxyquire('../lib/internals/routeHandler', {
                'action-handler1': function() {
                    this[this.config.name] = {};
                    this.response();
                },
                'action-handler2': function() {
                    this[this.config.name] = {};
                    this.response();
                }
            });
        });

        it('should throw when action type handler not found', () => {

            const context = {
                name   : 'route1',
                actions: [
                    {
                        name: 'action1',
                        type: 'not-here'
                    }
                ]
            };
            const request = {};
            const handler = new RouteHandler(context);

            return handler.handle(request, response)
                .catch((error) => {

                    expect(error).to.exist();
                    expect(error.code).to.equal('MODULE_NOT_FOUND');
                    expect(error.message).to.equal('Cannot find module \'not-here\'');
                });
        });

        it('should succeed when calling action handler', () => {

            const context = {
                name   : 'route1',
                actions: [
                    {
                        name: 'action1',
                        type: 'action-handler1'
                    },
                    {
                        name: 'action2',
                        type: 'action-handler2'
                    }
                ]
            };
            const request = {};
            const handler = new RouteHandler(context);

            return handler.handle(request, response)
                .then(function() {
                    expect(response.calledTwice).to.be.true();
                });
        });

    });
});
