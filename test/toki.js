'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code       = require('code');
const expect     = Code.expect;
const Sinon      = require('sinon');
const Promise    = require('bluebird');
const Exceptions = require('../lib/exceptions');
const Stubs      = require('./stubs').Toki;
const ConfigStub = require('./stubs').Configuration;

describe('toki', () => {

    let Toki;
    let router;
    let routerStub;

    const action1Spy  = Sinon.spy();
    const action2Spy  = Sinon.spy();
    const action3Spy  = Sinon.spy();
    const action4Spy  = Sinon.spy();
    const action5Spy  = Sinon.spy();
    const action6Spy  = Sinon.spy();
    const responseSpy = {
        send: Sinon.spy(),
        end : Sinon.spy()
    };
    const infoSpy     = Sinon.spy();
    const debugSpy    = Sinon.spy();
    const errorSpy    = Sinon.spy();

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

        action1Spy.reset();
        action2Spy.reset();
        action3Spy.reset();
        action4Spy.reset();
        action5Spy.reset();
        action6Spy.reset();
        responseSpy.send.reset();
        responseSpy.end.reset();
        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();

        const handler = (url, handlerFunc) => {
        };

        router = {
            get   : handler,
            post  : handler,
            put   : handler,
            delete: handler,
            patch : handler
        };

        routerStub = Sinon.stub(router);
        routerStub.route = (config) => {

            return routerStub[config.method.toLowerCase()](config.path, config.handler);
        };
        done();
    });

    it('should throw error when no options passed', (done) => {

        const options = undefined;
        Toki          = new TokiStub();

        expect(() => {

            return new Toki(options);
        }).to.throw('"options object" is required');
        done();
    });

    it('should throw error when invalid options passed', (done) => {

        const options = {};
        Toki          = new TokiStub();

        expect(() => {

            return new Toki(options);
        }).to.throw('child "router object" fails because ["router object" is required]');
        done();
    });

    it('should throw when calling getInstance before new', (done) => {

        Toki = new TokiStub();

        expect(() => {

            Toki.getInstance();
        }).to.throw(Exceptions.NoInstanceError);
        done();
    });

    it('should succeed creating toki instance', (done) => {

        const options = {
            router: routerStub
        };

        Toki = require('../lib');

        expect(() => {

            return new Toki(options);
        }).to.not.throw();
        done();
    });

    it('should emit error event when module config returns invalid config', (done) => {

        const options = {
            router: routerStub
        };
        const config  = {};
        const stubs   = {
            ConfigurationProxy: {
                TokiConfigProxy: {
                    config
                },
                path           : './internals/configuration',
                LoggerProxy    : {
                    path : './logger',
                    spies: {
                        infoSpy,
                        debugSpy,
                        errorSpy
                    }
                }
            }
        };

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        toki.on(Toki.constants.ERROR_EVENT, (error) => {

            expect(error).to.exist();
            expect(error.message).to.equal('child "routes" fails because ["routes" is required]');
            done();
        });
    });

    it('should get a toki instance and build routes', (done) => {

        const options     = {
            router: routerStub
        };
        const config      = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET',
                    actions   : [
                        {
                            name: 'action1',
                            type: 'proc1'
                        },
                        {
                            name: 'action2',
                            type: 'proc2'
                        }
                    ]
                },
                {
                    path      : 'route2',
                    httpAction: 'POST',
                    actions   : [
                        {
                            name: 'action3',
                            type: 'proc3'
                        },
                        {
                            name: 'action4',
                            type: 'proc4'
                        }
                    ]
                }
            ]
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
                    path: './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerStub.get.calledOnce).to.be.true();
            expect(routerStub.get.calledWith('route1')).to.be.true();
            expect(routerStub.post.calledOnce).to.be.true();
            expect(routerStub.post.calledWith('route2')).to.be.true();
            done();
        });
    });

    it('should get a toki instance and respond on sequential routes', (done) => {

        const routerGet  = Sinon.spy();
        const routerPost = Sinon.spy();
        let route1Handler;
        let route2Handler;

        router.get  = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        router.post = function(url, handler) {

            routerPost(url);
            route2Handler = handler;
        };
        router.route = (config) => {

            router[config.method.toLowerCase()](config.path, config.handler);
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
                },
                {
                    path      : 'route2',
                    httpAction: 'POST',
                    actions   : [
                        {
                            name: 'action4',
                            type: 'action-handler4'
                        },
                        {
                            name: 'action5',
                            type: 'action-handler5'
                        },
                        {
                            name: 'action6',
                            type: 'action-handler6'
                        }
                    ]
                }
            ]
        };
        const actionStubs = {
            'action-handler1': function(args) {

                action1Spy();
                return {
                    key1: 'value1'
                };
            },
            'action-handler2': function(args) {

                action2Spy();
                return Object.assign({
                    key2: 'value2'
                }, this.contexts.action1.output);
            },
            'action-handler3': function(args) {

                action3Spy();
                const response = this.contexts.action2.output;
                args.response.send(response);
            },
            'action-handler4': function(args) {

                action4Spy();
                return {
                    key4: 'value4'
                };
            },
            'action-handler5': function(args) {

                action5Spy();
                return Object.assign({
                    key5: 'value5'
                }, this.contexts.action4.output);
            },
            'action-handler6': function(args) {

                action6Spy();
                const response = this.contexts.action5.output;
                args.response.send(response);
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

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();
            expect(routerPost.calledOnce).to.be.true();
            expect(routerPost.calledWith('route2')).to.be.true();

            const response1 = {
                send: Sinon.spy(),
                end: Sinon.spy()
            };
            const response2 = {
                send: Sinon.spy(),
                end: Sinon.spy()
            };

            return Promise.join(
                route1Handler({}, response1),
                route2Handler({}, response2),
                () => {

                    expect(response1.send.called).to.be.true();
                    expect(response1.send.calledWith({
                        key1: 'value1',
                        key2: 'value2'
                    })).to.be.true();
                    expect(response2.send.called).to.be.true();
                    expect(response2.send.calledWith({
                        key4: 'value4',
                        key5: 'value5'
                    })).to.be.true();
                }
            ).then(done);
        });
    });

    it('should get a toki instance and respond on parallel routes', (done) => {

        const routerGet  = Sinon.spy();
        const routerPost = Sinon.spy();
        let route1Handler;
        let route2Handler;

        router.get  = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        router.post = function(url, handler) {

            routerPost(url);
            route2Handler = handler;
        };
        router.route = (config) => {

            router[config.method.toLowerCase()](config.path, config.handler);
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
                        [
                            {
                                name: 'action1',
                                type: 'action-handler1'
                            },
                            {
                                name: 'action2',
                                type: 'action-handler2'
                            }
                        ],
                        {
                            name: 'action3',
                            type: 'action-handler3'
                        }
                    ]
                },
                {
                    path      : 'route2',
                    httpAction: 'POST',
                    actions   : [
                        [
                            {
                                name: 'action4',
                                type: 'action-handler4'
                            },
                            {
                                name: 'action5',
                                type: 'action-handler5'
                            }
                        ],
                        {
                            name: 'action6',
                            type: 'action-handler6'
                        }
                    ]
                }
            ]
        };
        const actionStubs = {
            'action-handler1': function(args) {

                action1Spy();
                return {
                    key1: 'value1'
                };
            },
            'action-handler2': function(args) {

                action2Spy();
                return {
                    key2: 'value2'
                };
            },
            'action-handler3': function(args) {

                action3Spy();
                const response = Object.assign({}, this.contexts.action1.output, this.contexts.action2.output);
                args.response.send(response);
            },
            'action-handler4': function(args) {

                action4Spy();
                return {
                    key4: 'value4'
                };
            },
            'action-handler5': function(args) {

                action5Spy();
                return {
                    key5: 'value5'
                };
            },
            'action-handler6': function(args) {

                action6Spy();
                const response = Object.assign({}, this.contexts.action4.output, this.contexts.action5.output);
                args.response.send(response);
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

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();
            expect(routerPost.calledOnce).to.be.true();
            expect(routerPost.calledWith('route2')).to.be.true();

            const response1 = {
                send: Sinon.spy(),
                end: Sinon.spy()
            };
            const response2 = {
                send: Sinon.spy(),
                end: Sinon.spy()
            };

            return Promise.join(
                route1Handler({}, response1),
                route2Handler({}, response2),
                () => {

                    expect(response1.send.called).to.be.true();
                    expect(response1.send.calledWith({
                        key1: 'value1',
                        key2: 'value2'
                    })).to.be.true();
                    expect(response2.send.called).to.be.true();
                    expect(response2.send.calledWith({
                        key4: 'value4',
                        key5: 'value5'
                    })).to.be.true();
                }
            ).then(done);
        });
    });

    it('should get a toki instance and take action options', (done) => {

        const routerGet = Sinon.spy();
        let route1Handler;

        router.get = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        router.route = (config) => {

            router[config.method.toLowerCase()](config.path, config.handler);
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
                            name   : 'action1',
                            type   : 'action-handler1',
                            options: {}
                        },
                        {
                            name   : 'action2',
                            type   : 'action-handler2',
                            options: null
                        },
                        {
                            name   : 'action3',
                            type   : 'action-handler3',
                            options: {
                                key: 'value'
                            }
                        },
                        {
                            name     : 'action4',
                            type     : 'action-handler4',
                            myOptions: {}
                        }
                    ]
                }
            ]
        };
        const actionStubs = {
            'action-handler1': function(args) {

                action1Spy(args.action);
            },
            'action-handler2': function(args) {

                action2Spy(args.action);
            },
            'action-handler3': function(args) {

                action3Spy(args.action);
            },
            'action-handler4': function(args) {

                action4Spy(args.action);
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

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).true();

            return route1Handler({}, { send: () => {} })
                .then(
                    () => {

                        expect(action1Spy.called).true();
                        const args1 = action1Spy.args[0][0];
                        expect(args1.options).to.exist().and.be.object().and.equal({});

                        expect(action2Spy.called).true();
                        const args2 = action2Spy.args[0][0];
                        expect(args2.options).to.be.null();

                        expect(action3Spy.called).true();
                        const args3 = action3Spy.args[0][0];
                        expect(args3.options).to.exist().and.be.object().and.equal({
                            key: 'value'
                        });

                        expect(action4Spy.called).true();
                        const args4 = action4Spy.args[0][0];
                        expect(args4.options).to.not.exist();
                        expect(args4.myOptions).to.exist();

                    }
                ).then(done);
        });
    });

    it('should return same instance after new', (done) => {

        const options = {
            router: routerStub
        };
        const config  = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET',
                    actions   : [
                        {
                            name: 'action1',
                            type: 'proc1'
                        }
                    ]
                }
            ]
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
                    path: './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        let toki1;

        expect(() => {

            toki1 = new Toki(options);
        }).to.not.throw();

        expect(toki1).to.exist();
        expect(toki1).to.equal(toki);
        done();
    });

    it('should getInstance after new', (done) => {

        const options = {
            router: routerStub
        };
        const config  = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET',
                    actions   : [
                        {
                            name: 'action1',
                            type: 'proc1'
                        }
                    ]
                }
            ]
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
                    path: './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        let toki1;

        expect(() => {

            toki1 = Toki.getInstance();
        }).to.not.throw();

        expect(toki1).to.exist();
        expect(toki1).to.equal(toki);
        done();
    });

    it('should handle errors on route handlers', (done) => {

        const routerGet = Sinon.spy();
        let route1Handler;

        router.get        = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        router.route = (config) => {

            router[config.method.toLowerCase()](config.path, config.handler);
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

                action1Spy();
                return {
                    key1: 'value1'
                };
            },
            'action-handler2': function(args) {

                action2Spy();
                return Promise.reject(new Error());
            },
            'action-handler3': function(args) {

                action3Spy();
                args.response.send(this.action2);
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

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();

            const response1 = {
                send: Sinon.spy(),
                end: Sinon.spy()
            };

            return route1Handler({}, response1)
                .then(() => {

                    expect(response1.send.called).to.be.true();
                    expect(response1.send.args[0][0].message).to.equal('Internal Server Error');
                    expect(action1Spy.called).to.be.true();
                    expect(action2Spy.called).to.be.true();
                    expect(action3Spy.called).to.be.false();
                    done();
                });
        });
    });

    it('should handle config.changed event', (done) => {

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
                        }
                    ]
                }
            ]
        };
        const LoggerProxy = {
            path : './logger',
            spies: {
                infoSpy,
                debugSpy,
                errorSpy
            }
        };
        const configStub  = new ConfigStub.ConfigurationProxy({
            TokiConfigProxy: {
                config
            },
            path           : './internals/configuration',
            LoggerProxy
        });

        const stubs = {
            stubs            : configStub,
            RouteBuilderProxy: {
                path             : './internals/routeBuilder',
                RouteHandlerProxy: {
                    path: './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.CONFIG_CHANGED_EVENT, () => {

            done();
        });

        configStub.stub.tokiConfig.stub.emit('config.changed');
    });

    it('should log debug/info', (done) => {

        const options     = {
            router: routerStub
        };
        const config      = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET',
                    actions   : [
                        {
                            name: 'action1',
                            type: 'proc1'
                        }
                    ]
                }
            ]
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
                    path: './routeHandler',
                    LoggerProxy
                },
                LoggerProxy
            }
        };

        Toki = new TokiStub(stubs);
        new Toki(options);

        expect(debugSpy.called).to.be.true();
        expect(infoSpy.called).to.be.true();

        done();
    });

    it('should log error', (done) => {

        Toki = new TokiStub();

        expect(() => {

            Toki.getInstance();
        }).to.throw();

        expect(errorSpy.called).to.be.true();

        done();
    });
});
