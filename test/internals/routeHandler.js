'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code   = require('code');
const expect = Code.expect;
const Sinon  = require('sinon');
const Stubs  = require('../stubs').RouteHandler;

describe('route handler tests', () => {

    let RouteHandler;
    const action1Spy       = Sinon.spy();
    const action2Spy       = Sinon.spy();
    const action3Spy       = Sinon.spy();
    const action4Spy       = Sinon.spy();
    const actionPromiseSpy = Sinon.spy();

    const responseSpy = {
        send: Sinon.spy(),
        end : Sinon.spy()
    };
    const infoSpy     = Sinon.spy();
    const debugSpy    = Sinon.spy();
    const errorSpy    = Sinon.spy();

    class RouteHandlerStub {

        constructor(stubs = {}) {

            const options = {
                stubs,
                LoggerProxy: {
                    path : './logger',
                    spies: {
                        infoSpy,
                        debugSpy,
                        errorSpy
                    }
                }
            };

            return new Stubs.RouteHandlerStub(options);
        }
    }

    beforeEach((done) => {

        action1Spy.reset();
        action2Spy.reset();
        action3Spy.reset();
        action4Spy.reset();
        responseSpy.send.reset();
        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();

        RouteHandler = new RouteHandlerStub({
            'action-handler1': (input) => {

                action1Spy();
                input.server.response.send();
                return {
                    key: 'value1'
                };
            },
            'action-handler2': (input) => {

                action2Spy();
                input.server.response.send();
                return {
                    key: 'value2'
                };
            },
            'action-handler3': (input) => {

                action3Spy();
                input.server.response.send();
                return {
                    key: 'value3'
                };
            },
            'action-handler4': (input) => {

                action4Spy();
                input.server.response.send();
                return {
                    key: 'value4'
                };
            },
            'action-promise': function (input) {

                actionPromiseSpy();

                return new input.Promise((resolve, reject) => {

                    input.server.response.send();
                    return resolve();
                });
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
                expect(responseSpy.send.calledTwice).to.be.true();

                ['action1', 'action2'].forEach((i) => {

                    expect(this.contexts[i].output).to.exist().and.be.an.object();
                });
            });
    });

    it('should use a passed promise library', () => {

        const context = {
            name   : 'route1',
            actions: [
                {
                    name: 'actionPromise',
                    type: 'action-promise'
                }
            ]
        };

        const PromiseSpy = Sinon.spy(Promise);
        const request = {};
        const handler = new RouteHandler(context, {
            promise: PromiseSpy
        });

        return handler(request, responseSpy)
            .then(() => {

                expect(actionPromiseSpy.called).to.be.true();
                expect(PromiseSpy.called).to.be.true();
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

                expect(responseSpy.send.callCount).to.equal(4);

                ['action1', 'action2', 'action3', 'action4'].forEach((i) => {

                    expect(this.contexts[i].output).to.exist().and.be.an.object();
                });

            });
    });

    it('should succeed when sequential actions access previous action output', () => {

        RouteHandler = new RouteHandlerStub({
            'action-handler1': (input) => {

                action1Spy();
                input.server.response.send();
                return {
                    key1: 'value1'
                };
            },
            'action-handler2': function(input) {

                action2Spy();
                input.server.response.send();

                return Object.assign({
                    key2: 'value2'
                }, this.contexts.action1.output);
            },
            'action-handler3': function(input) {

                action3Spy();
                input.server.response.send();

                return Object.assign({
                    key3: 'value3'
                }, this.contexts.action2.output);
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
                expect(responseSpy.send.calledThrice).to.be.true();

                ['action1', 'action2', 'action3'].forEach((i) => {

                    expect(this.contexts[i].output).to.exist().and.be.an.object();
                });

                expect(this.contexts.action1.output).to.equal({
                    key1: 'value1'
                });

                expect(this.contexts.action2.output).to.equal({
                    key1: 'value1',
                    key2: 'value2'
                });

                expect(this.contexts.action3.output).to.equal({
                    key1: 'value1',
                    key2: 'value2',
                    key3: 'value3'
                });

            });
    });
});
