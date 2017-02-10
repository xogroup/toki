'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code           = require('code');
const expect         = Code.expect;
const Sinon          = require('sinon');
const Promise        = require('bluebird');
const Proxyquire     = require('proxyquire').noCallThru();
const Exceptions     = require('../lib/exceptions');
const Boom           = require('boom');
const EventEmitter   = require('events');
const tokiConfigName = require('../lib/internals').configuration.constants.CONFIG_MDDULE;
const tokiLoggerName = require('../lib/internals').logger.constants.LOGGER_MODULE;

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
    const responseSpy = Sinon.spy();
    const infoSpy     = Sinon.spy();
    const debugSpy    = Sinon.spy();
    const errorSpy    = Sinon.spy();

    class TokiConfigStub extends EventEmitter {

        constructor(config) {

            super();

            this.config = config;
        }

        get() {

            return Promise.resolve(this.config);
        }
    }

    class TokiConfigProxy {

        constructor(config) {

            this[tokiConfigName] = new TokiConfigStub(config);
        }

        get stub() {

            return this[tokiConfigName];
        }
    }

    class TokiLoggerStub {

        info(...args) {

            infoSpy();
            this.log(args);
        }

        debug(...args) {

            debugSpy();
            this.log(args);
        }

        error(...args) {

            errorSpy();
            this.log(args);
        }

        log(...args) {

            if (process.env.CONSOLE_DEBUG) {

                console.log(args);
            }
        }
    }

    class TokiLoggerProxy {

        constructor() {

            this[tokiLoggerName] = new TokiLoggerStub();
        }
    }

    class LoggerProxy {

        constructor(path) {

            this[path || './internals/logger'] = new LoggerStub();
        }
    }

    class LoggerStub {

        constructor() {

            return Proxyquire('../lib/internals/logger', new TokiLoggerProxy());
        }
    }

    class ConfigurationStub {

        constructor(config) {

            const proxy = new TokiConfigProxy(config);

            const stubs = Object.assign({},
                proxy,
                new LoggerProxy('./logger')
            );

            return Object.assign(Proxyquire('../lib/internals/configuration', stubs), {
                stub: proxy.stub
            });
        }
    }

    class ConfigurationProxy {

        constructor(config) {

            const stub                        = new ConfigurationStub(config);
            this['./internals/configuration'] = stub;
            this.stub                         = stub.stub;
        }
    }

    class TokiStub {

        constructor(stubs) {

            const _stubs = Object.assign(stubs || {},
                new LoggerProxy()
            );

            return Proxyquire('../lib', _stubs);
        }
    }

    class RouteHandlerStub {

        constructor(stubs) {

            const _stubs = Object.assign(stubs || {},
                new LoggerProxy('./logger')
            );

            return Proxyquire('../lib/internals/routeHandler', _stubs);
        }
    }

    class RouteHandlerProxy {

        constructor(stubs) {

            this['./routeHandler'] = new RouteHandlerStub(stubs);
        }
    }

    class RouteBuilderStub {

        constructor(stubs) {

            const _stubs = Object.assign({},
                stubs || {},
                new LoggerProxy('./logger'),
                new RouteHandlerProxy(stubs)
            );

            return Proxyquire('../lib/internals/routeBuilder', _stubs);
        }
    }

    class RouteBuilderProxy {
        constructor(stubs) {

            this['./internals/routeBuilder'] = new RouteBuilderStub(stubs);
        }
    }

    beforeEach((done) => {

        action1Spy.reset();
        action2Spy.reset();
        action3Spy.reset();
        action4Spy.reset();
        action5Spy.reset();
        action6Spy.reset();
        responseSpy.reset();
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

    it('should throw error when not installed config module', (done) => {

        const options = {
            router: routerStub
        };

        Toki = new TokiStub();

        expect(() => {

            return new Toki(options);
        }).to.throw('Cannot find module \'' + tokiConfigName + '\'');
        done();
    });

    it('should throw error when module config returns invalid config', (done) => {

        const options = {
            router: routerStub
        };
        const config  = {};
        const stubs   = new ConfigurationProxy(config);

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        toki.on(Toki.constants.ERROR_EVENT, (error) => {

            expect(error).to.exist();
            expect(error.message).to.equal('child "routes" fails because ["routes" is required]');
            done();
        });
    });

    it('should get a toki instance and build routes', (done) => {

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
        const stubs   = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy()
        );

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
                }, this.action1);
            },
            'action-handler3': function(args) {

                action3Spy();
                const response = this.action2;
                args.response(response);
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
                }, this.action4);
            },
            'action-handler6': function(args) {

                action6Spy();
                const response = this.action5;
                args.response(response);
            }
        };

        const stubs = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy(actionStubs));

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();
            expect(routerPost.calledOnce).to.be.true();
            expect(routerPost.calledWith('route2')).to.be.true();

            const response1 = Sinon.spy();
            const response2 = Sinon.spy();

            return Promise.join(
                route1Handler({}, response1),
                route2Handler({}, response2),
                () => {

                    expect(response1.called).to.be.true();
                    expect(response1.calledWith({
                        key1: 'value1',
                        key2: 'value2'
                    })).to.be.true();
                    expect(response2.called).to.be.true();
                    expect(response2.calledWith({
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

        router.get    = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        router.post   = function(url, handler) {

            routerPost(url);
            route2Handler = handler;
        };
        const options = {
            router
        };
        const config  = {
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
                const response = Object.assign({}, this.action1, this.action2);
                args.response(response);
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
                const response = Object.assign({}, this.action4, this.action5);
                args.response(response);
            }
        };

        const stubs = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy(actionStubs));

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();
            expect(routerPost.calledOnce).to.be.true();
            expect(routerPost.calledWith('route2')).to.be.true();

            const response1 = Sinon.spy();
            const response2 = Sinon.spy();

            return Promise.join(
                route1Handler({}, response1),
                route2Handler({}, response2),
                () => {

                    expect(response1.called).to.be.true();
                    expect(response1.calledWith({
                        key1: 'value1',
                        key2: 'value2'
                    })).to.be.true();
                    expect(response2.called).to.be.true();
                    expect(response2.calledWith({
                        key4: 'value4',
                        key5: 'value5'
                    })).to.be.true();
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
        const stubs   = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy());

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
        const stubs   = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy());

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

        router.get    = function(url, handler) {

            routerGet(url);
            route1Handler = handler;
        };
        const options = {
            router
        };
        const config  = {
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
                args.response(this.action2);
            }
        };
        const stubs       = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy(actionStubs));

        Toki       = new TokiStub(stubs);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();

            const response1 = Sinon.spy();

            return route1Handler({}, response1)
                .then(() => {

                    expect(response1.called).to.be.true();
                    expect(response1.args[0][0].message).to.equal('Internal Server Error');
                    expect(action1Spy.called).to.be.true();
                    expect(action2Spy.called).to.be.true();
                    expect(action3Spy.called).to.be.false();
                    done();
                });
        });
    });

    it('should handle config.changed event', (done) => {

        const options    = {
            router
        };
        const config     = {
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
        const configStub = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy());

        Toki       = new TokiStub(configStub);
        const toki = new Toki(options);

        expect(toki).to.be.an.object();

        toki.on(Toki.constants.CONFIG_CHANGED_EVENT, () => {

            done();
        });

        configStub.stub.emit('config.changed');
    });

    it('should log debug/info', (done) => {

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
        const stubs   = Object.assign({},
            new ConfigurationProxy(config),
            new RouteBuilderProxy());

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
