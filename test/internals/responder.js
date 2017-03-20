'use strict';

const Sinon  = require('sinon');
const Promise = require('bluebird');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;

const Code   = require('code');
const expect = Code.expect;

const Responder = require('../../lib/internals/responder');

describe('Responder', () => {

    const responseSpy = {
        code: Sinon.spy(),
        send: Sinon.spy()
    };

    beforeEach((done) => {

        responseSpy.code.reset();
        responseSpy.send.reset();
        done();
    });

    it('should fail if the action config does not contain "clientResponse"', (done) => {

        expect(Responder.bind({
            config: {}
        }, {})).to.throw('responder action configuration must include response mapping configs');
        done();
    });

    it('should fail if the action clientResponse config does not contain "statusCode"', (done) => {

        const context = {
            config: {
                clientResponse: {}
            }
        };

        expect(Responder.bind(context, {})).to.throw('child "statusCode" fails because ["statusCode" is required]');
        done();
    });

    it('should fail if the action clientResponse.statusCode is not a number or string', (done) => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: true
                }
            }
        };

        expect(Responder.bind(context, {})).to.throw('child "statusCode" fails because ["statusCode" must be a string, "statusCode" must be a number]');
        done();
    });

    it('should fail if the action clientResponse.payload is not an object or string', (done) => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: 201,
                    payload   : 201
                }
            }
        };

        expect(Responder.bind(context, {})).to.throw('child "payload" fails because ["payload" must be a string, "payload" must be an object]');
        done();
    });

    it('should send the response with the given statusCode', () => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: 200
                }
            },
            server: {
                response: responseSpy
            }
        };

        return Promise
            .resolve()
            .bind(context)
            .then(Responder)
            .then(() => {

                expect(responseSpy.send.calledOnce).to.be.true();
                expect(responseSpy.code.calledOnce).to.be.true();
                expect(responseSpy.code.calledWith(200)).to.be.true();
            });
    });

    it('should send the response with the given statusCode and payload', () => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: 200,
                    payload   : {
                        send: 'this data'
                    }
                }
            },
            server: {
                response: responseSpy
            }
        };

        return Promise
            .resolve()
            .bind(context)
            .then(Responder)
            .then(() => {

                expect(responseSpy.send.calledOnce).to.be.true();
                expect(responseSpy.send.calledWith(context.config.clientResponse.payload)).to.be.true();
                expect(responseSpy.code.calledOnce).to.be.true();
                expect(responseSpy.code.calledWith(200)).to.be.true();
            });
    });

    it('should support templated clientResponse.statusCode string', () => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: '{{previousStep.output.code}}'
                }
            },
            server: {
                response: responseSpy
            },
            contexts: {
                previousStep: {
                    output: {
                        code: 201
                    }
                }
            }
        };

        return Promise
            .resolve()
            .bind(context)
            .then(Responder)
            .then(() => {

                expect(responseSpy.send.calledOnce).to.be.true();
                expect(responseSpy.code.calledOnce).to.be.true();
                expect(responseSpy.code.calledWith(201)).to.be.true();
            });
    });

    it('should support templated clientResponse.payload string', () => {

        const context = {
            config: {
                clientResponse: {
                    statusCode: '{{previousStep.output.code}}',
                    payload   : '{{previousStep.output}}'
                }
            },
            server: {
                response: responseSpy
            },
            contexts: {
                previousStep: {
                    output: {
                        code: 201,
                        data: 'to send'
                    }
                }
            }
        };

        return Promise
            .resolve()
            .bind(context)
            .then(Responder)
            .then(() => {

                expect(responseSpy.send.calledOnce).to.be.true();
                expect(responseSpy.send.calledWith(context.contexts.previousStep.output)).to.be.true();
                expect(responseSpy.code.calledOnce).to.be.true();
                expect(responseSpy.code.calledWith(201)).to.be.true();
            });
    });
});
