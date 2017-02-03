'use strict';

// const Lab = require('lab');
// const lab = exports.lab = Lab.script();
// const describe = lab.describe;
// const it       = lab.it;

const Code         = require('code');
const expect       = Code.expect;
const Sinon        = require('sinon');
const Promise      = require('bluebird');
const Proxyquire   = require('proxyquire').noCallThru();
const EventEmitter = require('events');
const Internals    = require('../lib/internals');

describe('internals tests', () => {

    describe('options validation', () => {

        let Options;

        before(() => {

            Options = Internals.options;
        });

        it('should throw if no options supplied', () => {

            const input = undefined;
            expect(() => {

                return new Options(input);
            }).to.throw('"options object" is required');
        });

        it('should throw if options.router missing', () => {

            const input = {};
            expect(() => {

                return new Options(input);
            }).to.throw('child "router object" fails because ["router object" is required]');
        });

        it('should throw if options.router empty', () => {

            const input = {
                router: {}
            };
            expect(() => {

                return new Options(input);
            }).to.throw('child "router object" fails because [child "get" fails because ["get" is required]]');
        });

        it('should throw if options.router.get not a function', () => {

            const input = {
                router: {
                    get: {}
                }
            };
            expect(() => {

                return new Options(input);
            }).to.throw('child "router object" fails because [child "get" fails because ["get" must be a Function]]');
        });

        it('should throw if options.router.get function missing expected args', () => {

            const input = {
                router: {
                    get: () => {
                    }
                }
            };
            expect(() => {

                return new Options(input);
            }).to.throw('child "router object" fails because [child "get" fails because ["get" must have an arity of 2]]');
        });

        it('should pass options.router.get not a function', () => {

            const input = {
                router: {
                    get   : (a, b) => {
                    },
                    post  : (a, b) => {
                    },
                    put   : (a, b) => {
                    },
                    delete: (a, b) => {
                    },
                    patch : (a, b) => {
                    },
                }
            };

            const options = new Options(input);
            expect(options).to.be.an.object();
            expect(options.value).to.be.an.object();
            expect(options.value.router).to.exist().and.be.an.object();
        });
    });

    describe('configuration validation', () => {

        let Configuration;

        beforeEach(() => {
        });

        it('should throw if no chronos-config installed', () => {

            Configuration = Proxyquire('../lib/internals/configuration', {});

            expect(() => {

                return new Configuration();
            }).to.throw('Cannot find module \'chronos-config\'');
        });

        it('should create instance', () => {

            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {}
            });

            let instance;
            expect(() => {

                instance = new Configuration();
            }).to.not.throw();

            expect(instance).to.be.an.object();
            expect(instance.getConfiguration).to.be.a.function();
        });

        it('should throw if configuration is empty', () => {

            const config  = undefined;
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('"chronos configuration" is required');
                });
        });

        it('should throw if routes are missing', () => {

            const config  = {};
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" is required]');
                });
        });

        it('should throw if routes are invalid type', () => {

            const config  = {
                routes: ''
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" must be an array]');
                });
        });

        it('should throw if routes are empty', () => {

            const config  = {
                routes: []
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" must contain at least 1 items]');
                });
        });

        it('should throw if routes.route are invalid type', () => {

            const config  = {
                routes: ['']
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because ["0" must be an object]]');
                });
        });

        it('should throw if routes.route are empty', () => {

            const config  = {
                routes: [{}]
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "path" fails because ["path" is required]]]');
                });
        });

        it('should throw if route.path empty', () => {

            const config  = {
                routes: [
                    {
                        path: ''
                    }
                ]
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "path" fails because ["path" is not allowed to be empty]]]');
                });
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

            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "httpAction" fails because ["httpAction" must be one of [GET, POST, PUT, DELETE, PATCH]]]]');
                });
        });

        it('should throw if route.actions invalid', () => {

            const config  = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : ''
                    }
                ]
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" must be an array]]]');
                });
        });

        it('should throw if route.actions empty', () => {

            const config  = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : []
                    }
                ]
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" must contain at least 1 items]]]');
                });
        });

        it('should throw if route.actions.action invalid', () => {

            const config  = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : [{}]
                    }
                ]
            };
            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();
            return instance.getConfiguration()
                .catch((error) => {
                    expect(error).to.exist();
                    expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" at position 0 does not match any of the allowed types]]]');
                });
        });

        it('should pass validation with sequential actions', () => {

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

            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();

            return instance.getConfiguration()
                .then((config) => {
                    expect(config).to.be.an.object();
                    expect(config.routes).to.exist().and.be.an.array();

                    expect(instance.value).to.be.an.object();
                    expect(instance.value.routes).to.exist().and.be.an.array();
                });
        });

        it('should pass validation with parallel actions', () => {

            const config = {
                routes: [
                    {
                        path      : 'path',
                        httpAction: 'GET',
                        actions   : [
                            [
                                {
                                    name: 'name',
                                    type: 'type'
                                },
                                {
                                    name: 'name',
                                    type: 'type'
                                }
                            ]
                        ]
                    }
                ]
            };

            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': {
                    get: () => {
                        return Promise.resolve(config);
                    }
                }
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();

            return instance.getConfiguration()
                .then((config) => {
                    expect(config).to.be.an.object();
                    expect(config.routes).to.exist().and.be.an.array();

                    expect(instance.value).to.be.an.object();
                    expect(instance.value.routes).to.exist().and.be.an.array();
                });
        });

        it('should handle config_changed event', (done) => {

            class ChronosConfig extends EventEmitter {
            }
            const chronosConfig = new ChronosConfig();

            Configuration = Proxyquire('../lib/internals/configuration', {
                'chronos-config': chronosConfig
            });

            const instance = new Configuration();
            expect(instance).to.be.an.object();

            instance.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

                done();
            });

            chronosConfig.emit(Configuration.constants.CONFIG_CHANGED_EVENT);
        });
    });

    describe('rotues builder', () => {

        let RouteBuilder;
        let router;
        let routerStub;

        before(() => {

            RouteBuilder = Internals.routeBuilder;
        });

        beforeEach(() => {

            const handler = (url, handler) => {
            };

            router = {
                get   : handler,
                post  : handler,
                put   : handler,
                delete: handler,
                patch : handler
            };

            routerStub = Sinon.stub(router);
        });

        it('should build routes om some http methods', () => {

            const input = {
                routes: [
                    {
                        path      : 'route1',
                        httpAction: 'GET'
                    },
                    {
                        path      : 'route2',
                        httpAction: 'POST'
                    }
                ],
                router: routerStub
            };

            RouteBuilder.build(input);

            expect(routerStub.get.calledOnce).to.be.true();
            expect(routerStub.get.calledWith('route1')).to.be.true();
            expect(routerStub.post.calledOnce).to.be.true();
            expect(routerStub.post.calledWith('route2')).to.be.true();
            expect(routerStub.put.calledOnce).to.be.false();
            expect(routerStub.delete.calledOnce).to.be.false();
            expect(routerStub.patch.calledOnce).to.be.false();
        });

        it('should build routes on dupe methods', () => {

            const input = {
                routes: [
                    {
                        path      : 'route1',
                        httpAction: 'GET'
                    },
                    {
                        path      : 'route2',
                        httpAction: 'GET'
                    }
                ],
                router: routerStub
            };

            RouteBuilder.build(input);

            expect(routerStub.get.calledTwice).to.be.true();
            expect(routerStub.get.calledWith('route1')).to.be.true();
            expect(routerStub.get.calledWith('route2')).to.be.true();
            expect(routerStub.post.calledOnce).to.be.false();
            expect(routerStub.put.calledOnce).to.be.false();
            expect(routerStub.delete.calledOnce).to.be.false();
            expect(routerStub.patch.calledOnce).to.be.false();
        });

        it('should build routes on all http methods', () => {

            const input = {
                routes: [
                    {
                        path      : 'route1',
                        httpAction: 'GET'
                    },
                    {
                        path      : 'route2',
                        httpAction: 'POST'
                    },
                    {
                        path      : 'route3',
                        httpAction: 'PUT'
                    },
                    {
                        path      : 'route4',
                        httpAction: 'DELETE'
                    },
                    {
                        path      : 'route5',
                        httpAction: 'PATCH'
                    }
                ],
                router: routerStub
            };

            RouteBuilder.build(input);

            expect(routerStub.get.calledOnce).to.be.true();
            expect(routerStub.get.calledWith('route1')).to.be.true();
            expect(routerStub.post.calledOnce).to.be.true();
            expect(routerStub.post.calledWith('route2')).to.be.true();
            expect(routerStub.put.calledOnce).to.be.true();
            expect(routerStub.put.calledWith('route3')).to.be.true();
            expect(routerStub.delete.calledOnce).to.be.true();
            expect(routerStub.delete.calledWith('route4')).to.be.true();
            expect(routerStub.patch.calledOnce).to.be.true();
            expect(routerStub.patch.calledWith('route5')).to.be.true();
        });
    });

    describe('route handler', () => {

        let RouteHandler;
        const action1Spy  = Sinon.spy();
        const action2Spy  = Sinon.spy();
        const action3Spy  = Sinon.spy();
        const action4Spy  = Sinon.spy();
        const responseSpy = Sinon.spy();

        beforeEach(() => {

            action1Spy.reset();
            action2Spy.reset();
            action3Spy.reset();
            action4Spy.reset();
            responseSpy.reset();

            RouteHandler = Proxyquire('../lib/internals/routeHandler', {
                'action-handler1': function(input) {

                    action1Spy();
                    input.response();
                    return {
                        key: 'value1'
                    };
                },
                'action-handler2': function(input) {

                    action2Spy();
                    input.response();
                    return {
                        key: 'value2'
                    };
                },
                'action-handler3': function(input) {

                    action3Spy();
                    input.response();
                    return {
                        key: 'value3'
                    };
                },
                'action-handler4': function(input) {

                    action4Spy();
                    input.response();
                    return {
                        key: 'value4'
                    };
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

            return handler.handle(request, responseSpy)
                .catch((error) => {

                    expect(error).to.exist();
                    expect(error.code).to.equal('MODULE_NOT_FOUND');
                    expect(error.message).to.equal('Cannot find module \'not-here\'');
                });
        });

        it('should succeed when calling sequential actions', () => {

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

            return handler.handle(request, responseSpy)
                .then(function() {
                    expect(action1Spy.calledOnce).to.be.true();
                    expect(action2Spy.calledOnce).to.be.true();
                    expect(action1Spy.calledBefore(action2Spy)).to.be.true();
                    expect(responseSpy.calledTwice).to.be.true();

                    [0, 1].forEach((i) => {
                        expect(this[context.actions[i].name]).to.exist().and.be.an.object();
                    });
                });
        });

        it('should succeed when calling parallel actions', () => {

            const context = {
                name   : 'route1',
                actions: [
                    {
                        name: 'action1',
                        type: 'action-handler1'
                    },
                    [
                        {
                            name: 'action2',
                            type: 'action-handler2'
                        },
                        {
                            name: 'action3',
                            type: 'action-handler3'
                        }
                    ],
                    {
                        name: 'action4',
                        type: 'action-handler4'
                    }
                ]
            };
            const request = {};
            const handler = new RouteHandler(context);

            return handler.handle(request, responseSpy)
                .then(function() {
                    expect(action1Spy.calledOnce).to.be.true();
                    expect(action2Spy.calledOnce).to.be.true();
                    expect(action3Spy.calledOnce).to.be.true();
                    expect(action4Spy.calledOnce).to.be.true();

                    expect(action1Spy.calledBefore(action2Spy)).to.be.true();
                    expect(action1Spy.calledBefore(action3Spy)).to.be.true();
                    expect(action1Spy.calledBefore(action4Spy)).to.be.true();

                    expect(action4Spy.calledAfter(action2Spy)).to.be.true();
                    expect(action4Spy.calledAfter(action3Spy)).to.be.true();

                    expect(responseSpy.callCount).to.equal(4);

                    [0, 2].forEach((i) => {
                        expect(this[context.actions[i].name]).to.exist().and.be.an.object();
                    });

                    [0, 1].forEach((i) => {
                        expect(this[context.actions[1][i].name]).to.exist().and.be.an.object();
                    });

                });
        });

        it('should succeed when sequential actions access previous action output', () => {

            RouteHandler = Proxyquire('../lib/internals/routeHandler', {
                'action-handler1': function(input) {

                    action1Spy();
                    input.response();
                    return {
                        key1: 'value1'
                    };
                },
                'action-handler2': function(input) {

                    action2Spy();
                    input.response();

                    return Object.assign({
                        key2: 'value2'
                    }, this['action1']);
                },
                'action-handler3': function(input) {

                    action3Spy();
                    input.response();

                    return Object.assign({
                        key3: 'value3'
                    }, this['action2']);
                }
            });

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
                    },
                    {
                        name: 'action3',
                        type: 'action-handler3'
                    }
                ]
            };
            const request = {};
            const handler = new RouteHandler(context);

            return handler.handle(request, responseSpy)
                .then(function() {
                    expect(action1Spy.calledOnce).to.be.true();
                    expect(action2Spy.calledOnce).to.be.true();
                    expect(action3Spy.calledOnce).to.be.true();
                    expect(action1Spy.calledBefore(action2Spy)).to.be.true();
                    expect(action2Spy.calledBefore(action3Spy)).to.be.true();
                    expect(responseSpy.calledThrice).to.be.true();

                    [0, 1, 2].forEach((i) => {
                        expect(this[context.actions[i].name]).to.exist().and.be.an.object();
                    });

                    expect(this['action1']).to.equal({
                        key1: 'value1'
                    });

                    expect(this['action2']).to.equal({
                        key1: 'value1',
                        key2: 'value2'
                    });

                    expect(this['action3']).to.equal({
                        key1: 'value1',
                        key2: 'value2',
                        key3: 'value3'
                    });

                });
        });
    });
})
;
