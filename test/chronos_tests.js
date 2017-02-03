'use strict';

// const Lab = require('lab');
// const lab = exports.lab = Lab.script();
// const describe = lab.describe;
// const it       = lab.it;

const Code       = require('code');
const expect     = Code.expect;
const Sinon      = require('sinon');
const Promise    = require('bluebird');
const Proxyquire = require('proxyquire').noCallThru();

describe.skip('chronos', () => {

    let Chronos;
    let router;
    let routerStub;

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

        Chronos = Proxyquire('../lib', {
            'chronos-config': function() {
                return {};
            }
        });

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

    it('should throw error when no options passed', () => {

        const options = undefined;
        expect(() => {

            return new Chronos(options);
        }).to.throw('"options object" is required');
    });

    it('should throw error when invalid options passed', () => {

        const options = {};
        expect(() => {

            return new Chronos(options);
        }).to.throw('child "router object" fails because ["router object" is required]');
    });

    it('should throw when calling getInstance before new', () => {

        expect(() => {
            Chronos.getInstance();
        }).to.throw('Chronos needs to be created first via new Chronos(options)');
    });

    it('should throw error when not installed config module name passed', () => {

        const options = {
            router: routerStub
        };
        expect(() => {

            return new Chronos(options);
        }).to.throw('Cannot find module \'not-here\'');
    });

    it('should throw error when module config returns invalid config', () => {

        const options = {
            config: 'chronos-config',
            router: routerStub
        };

        Chronos = Proxyquire('../lib', {
            'chronos-config': function() {
                return {
                    routes: []
                };
            }
        });

        expect(() => {

            return new Chronos(options);
        }).to.throw('child "routes" fails because ["routes" must contain at least 1 items]');
    });

    it('should get a chronos instance and build routes', () => {

        const options = {
            config: 'chronos-config',
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

        Chronos = Proxyquire('../lib', {
            'chronos-config': function() {
                return config;
            }
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        expect(routerStub.get.calledOnce).to.be.true();
        expect(routerStub.get.calledWith('route1')).to.be.true();
        expect(routerStub.post.calledOnce).to.be.true();
        expect(routerStub.post.calledWith('route2')).to.be.true();
    });

    it('should get a chronos instance and respond on routes', () => {

        const routerGet  = Sinon.spy();
        const routerPost = Sinon.spy();
        let route1;
        let route2;
        router           = {
            routes: {},
            get   : (url, handler) => {
                routerGet();
                route1 = handler;
            },
            post  : (url, handler) => {
                routerPost();
                route2 = handler;
            }
        };
        const options    = {
            config: 'chronos-config',
            router: router
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
                        },
                        {
                            name: 'action2',
                            type: 'action-handler2'
                        }
                    ]
                },
                {
                    path      : 'route2',
                    httpAction: 'POST',
                    actions   : [
                        {
                            name: 'action3',
                            type: 'action-handler3'
                        },
                        {
                            name: 'action4',
                            type: 'action-handler4'
                        }
                    ]
                }
            ]
        };

        Chronos = Proxyquire('../lib', {
            'chronos-config' : function() {
                return config;
            },
            'action-handler1': function(args) {

                action1Spy();
                args.response();
                return {
                    key: 'value1'
                };
            },
            'action-handler2': function(args) {

                action2Spy();
                args.response();
                return {
                    key: 'value2'
                };
            },
            'action-handler3': function(args) {

                action3Spy();
                args.response();
                return {
                    key: 'value3'
                };
            },
            'action-handler4': function(args) {

                action4Spy();
                args.response();
                return {
                    key: 'value4'
                };
            }
        });

        const chronos = new Chronos(options);
        expect(chronos).to.be.an.object();

        expect(routerGet.calledOnce).to.be.true();
        expect(routerPost.calledOnce).to.be.true();

        const response1 = Sinon.spy();
        const response2 = Sinon.spy();

        return Promise.join(
            router['route1']({}, response1),
            router['route2']({}, response2),
            (value1, value2) => {

                expect(routerGet.calledWith('route1')).to.be.true();
                expect(routerPost.calledWith('route2')).to.be.true();

                expect(response1.called).to.be.true();
                expect(response2.called).to.be.true();
            }
        );
    });

    it('should getInstance after new', () => {

        const options = {
            router: routerStub
        };

        const chronos = new Chronos(options);

        let chronos1;

        expect(() => {
            chronos1 = Chronos.getInstance();
        }).to.not.throw();
    });
});
