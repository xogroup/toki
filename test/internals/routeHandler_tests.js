'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code              = require('code');
const expect            = Code.expect;
const Sinon             = require('sinon');
const Proxyquire        = require('proxyquire').noCallThru();
const handlerModulePath = '../../lib/internals/routeHandler';
const tokiLoggerName  = require('../../lib/internals').logger.constants.LOGGER_MODULE;

describe('route handler tests', () => {

    let RouteHandler;
    const action1Spy  = Sinon.spy();
    const action2Spy  = Sinon.spy();
    const action3Spy  = Sinon.spy();
    const action4Spy  = Sinon.spy();
    const responseSpy = Sinon.spy();
    const infoSpy     = Sinon.spy();
    const debugSpy    = Sinon.spy();
    const errorSpy    = Sinon.spy();

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

        constructor() {

            this['./logger'] = new LoggerStub();
        }
    }

    class LoggerStub {

        constructor() {

            return Proxyquire('../../lib/internals/logger', new TokiLoggerProxy());
        }
    }

    class RouteHandlerStub {

        constructor(stubs) {

            const _stubs = Object.assign({},
                stubs,
                new LoggerProxy()
            );

            return Proxyquire(handlerModulePath, _stubs);
        }
    }

    beforeEach((done) => {

        action1Spy.reset();
        action2Spy.reset();
        action3Spy.reset();
        action4Spy.reset();
        responseSpy.reset();
        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();

        RouteHandler = new RouteHandlerStub({
            'action-handler1': (input) => {

                action1Spy();
                input.response();
                return {
                    key: 'value1'
                };
            },
            'action-handler2': (input) => {

                action2Spy();
                input.response();
                return {
                    key: 'value2'
                };
            },
            'action-handler3': (input) => {

                action3Spy();
                input.response();
                return {
                    key: 'value3'
                };
            },
            'action-handler4': (input) => {

                action4Spy();
                input.response();
                return {
                    key: 'value4'
                };
            }
        });
        done();
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

        return handler(request, responseSpy)
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

        return handler(request, responseSpy)
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

        return handler(request, responseSpy)
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

        RouteHandler = new RouteHandlerStub({
            'action-handler1': (input) => {

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
                }, this.action1);
            },
            'action-handler3': function(input) {

                action3Spy();
                input.response();

                return Object.assign({
                    key3: 'value3'
                }, this.action2);
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

        return handler(request, responseSpy)
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

                expect(this.action1).to.equal({
                    key1: 'value1'
                });

                expect(this.action2).to.equal({
                    key1: 'value1',
                    key2: 'value2'
                });

                expect(this.action3).to.equal({
                    key1: 'value1',
                    key2: 'value2',
                    key3: 'value3'
                });

            });
    });
});
