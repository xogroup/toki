'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code         = require('code');
const expect       = Code.expect;
const Sinon        = require('sinon');
const Promise      = require('bluebird');
const Proxyquire   = require('proxyquire').noCallThru();
const Exceptions   = require('../lib/exceptions');
const Boom         = require('boom');
const EventEmitter = require('events');

describe('chronos', () => {

    let Chronos;
    let router;
    let routerStub;

    const action1Spy  = Sinon.spy();
    const action2Spy  = Sinon.spy();
    const action3Spy  = Sinon.spy();
    const action4Spy  = Sinon.spy();
    const action5Spy  = Sinon.spy();
    const action6Spy  = Sinon.spy();
    const responseSpy = Sinon.spy();

    beforeEach((done) => {

        action1Spy.reset();
        action2Spy.reset();
        action3Spy.reset();
        action4Spy.reset();
        action5Spy.reset();
        action6Spy.reset();
        responseSpy.reset();

        Chronos = Proxyquire('../lib', {
            'chronos-config': () => {

                return {};
            }
        });

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
        expect(() => {

            return new Chronos(options);
        }).to.throw('"options object" is required');
        done();
    });

    it('should throw error when invalid options passed', (done) => {

        const options = {};
        expect(() => {

            return new Chronos(options);
        }).to.throw('child "router object" fails because ["router object" is required]');
        done();
    });

    it('should throw when calling getInstance before new', (done) => {

        expect(() => {

            Chronos.getInstance();
        }).to.throw(Exceptions.NoInstanceError);
        done();
    });

    it('should throw error when not installed chronos-config module', (done) => {

        const options = {
            router: routerStub
        };
        expect(() => {

            return new Chronos(options);
        }).to.throw('Cannot find module \'chronos-config\'');
        done();
    });

    it('should throw error when module config returns invalid config', (done) => {

        const options       = {
            router: routerStub
        };
        const config        = {};
        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });
        Chronos             = Proxyquire('../lib', {
            './internals/configuration': Configuration
        });

        const chronos = new Chronos(options);

        chronos.on(Chronos.constants.ERROR_EVENT, (error) => {

            expect(error).to.exist();
            expect(error.message).to.equal('child "routes" fails because ["routes" is required]');
            done();
        });
    });

    it('should get a chronos instance and build routes', (done) => {

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

        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });
        Chronos             = Proxyquire('../lib', {
            './internals/configuration': Configuration
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        chronos.on(Chronos.constants.READY_EVENT, () => {

            expect(routerStub.get.calledOnce).to.be.true();
            expect(routerStub.get.calledWith('route1')).to.be.true();
            expect(routerStub.post.calledOnce).to.be.true();
            expect(routerStub.post.calledWith('route2')).to.be.true();
            done();
        });
    });

    it('should get a chronos instance and respond on sequential routes', (done) => {

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

        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const RouteHandler = Proxyquire('../lib/internals/routeHandler', {
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
        });

        const RouteBuilder = Proxyquire('../lib/internals/routeBuilder', {
            './routeHandler': RouteHandler
        });

        Chronos = Proxyquire('../lib', {
            './internals/configuration': Configuration,
            './internals/routeBuilder' : RouteBuilder
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        chronos.on(Chronos.constants.READY_EVENT, () => {

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

    it('should get a chronos instance and respond on parallel routes', (done) => {

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

        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const RouteHandler = Proxyquire('../lib/internals/routeHandler', {
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
        });

        const RouteBuilder = Proxyquire('../lib/internals/routeBuilder', {
            './routeHandler': RouteHandler
        });

        Chronos = Proxyquire('../lib', {
            './internals/configuration': Configuration,
            './internals/routeBuilder' : RouteBuilder
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        chronos.on(Chronos.constants.READY_EVENT, () => {

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

        const options       = {
            router: routerStub
        };
        const config        = {
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
        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });
        Chronos             = Proxyquire('../lib', {
            './internals/configuration': Configuration
        });

        const chronos = new Chronos(options);

        let chronos1;

        expect(() => {

            chronos1 = new Chronos(options);
        }).to.not.throw();

        expect(chronos1).to.exist();
        expect(chronos1).to.equal(chronos);
        done();
    });

    it('should getInstance after new', (done) => {

        const options       = {
            router: routerStub
        };
        const config        = {
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
        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });
        Chronos             = Proxyquire('../lib', {
            './internals/configuration': Configuration
        });

        const chronos = new Chronos(options);

        let chronos1;

        expect(() => {

            chronos1 = Chronos.getInstance();
        }).to.not.throw();

        expect(chronos1).to.exist();
        expect(chronos1).to.equal(chronos);
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

        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const RouteHandler = Proxyquire('../lib/internals/routeHandler', {
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
        });

        const RouteBuilder = Proxyquire('../lib/internals/routeBuilder', {
            './routeHandler': RouteHandler
        });

        Chronos = Proxyquire('../lib', {
            './internals/configuration': Configuration,
            './internals/routeBuilder' : RouteBuilder
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        chronos.on(Chronos.constants.READY_EVENT, () => {

            expect(routerGet.calledOnce).to.be.true();
            expect(routerGet.calledWith('route1')).to.be.true();

            const response1 = Sinon.spy();

            return route1Handler({}, response1)
                .then(() => {

                    expect(response1.called).to.be.true();
                    expect(response1.calledWith(Boom.badImplementation()));

                    expect(action1Spy.called).to.be.true();
                    expect(action2Spy.called).to.be.true();
                    expect(action3Spy.called).to.be.false();

                    done();
                });
        });
    });

    it('should handle config.changed event', (done) => {

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
                        }
                    ]
                }
            ]
        };

        class ChronosConfig extends EventEmitter {
            get() {

                return Promise.resolve(config);
            }
        }
        const chronosConfig = new ChronosConfig();

        const Configuration = Proxyquire('../lib/internals/configuration', {
            'chronos-config': chronosConfig
        });

        Chronos = Proxyquire('../lib', {
            './internals/configuration': Configuration
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        chronos.on(Chronos.constants.CONFIG_CHANGED_EVENT, () => {

            done();
        });

        chronosConfig.emit('config.changed');
    });

    //logging
});
