'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach     = lab.beforeEach;
const it       = lab.it;

const Code   = require('code');
const expect = Code.expect;
const Sinon  = require('sinon');
const Stubs  = require('../stubs').Logger;

describe('logger tests', () => {

    let Logger;

    const infoSpy  = Sinon.spy();
    const debugSpy = Sinon.spy();
    const errorSpy = Sinon.spy();

    beforeEach((done) => {

        Logger = new Stubs.LoggerStub({
            path : '../../lib/internals/logger',
            spies: {
                infoSpy,
                debugSpy,
                errorSpy
            }
        });

        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();
        done();
    });

    it('should succeed requiring toki-logger', (done) => {

        Logger = require('../../lib/internals').logger;

        expect(() => {

            new Logger();
        }).to.not.throw();
        done();
    });

    it('should get a logger instance', (done) => {

        const logger = new Logger();

        expect(logger).to.be.an.object();
        done();
    });

    it('should logger be a singleton', (done) => {

        const logger  = new Logger();
        const logger1 = new Logger();

        expect(logger).to.be.an.object();
        expect(logger1).to.be.an.object();
        expect(logger1).to.equal(logger);
        done();
    });

    it('should logger be a singleton', (done) => {

        const logger  = new Logger();
        const logger1 = Logger.Instance;

        expect(logger).to.be.an.object();
        expect(logger1).to.be.an.object();
        expect(logger1).to.equal(logger);
        done();
    });

    it('should log', (done) => {

        const logger = new Logger();

        logger.info('info');
        logger.debug('debug');
        logger.error('error');

        expect(infoSpy.called).to.be.true();
        expect(debugSpy.called).to.be.true();
        expect(errorSpy.called).to.be.true();
        done();
    });
});
