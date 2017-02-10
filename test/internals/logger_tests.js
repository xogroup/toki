'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const beforeEach     = lab.beforeEach;
const it       = lab.it;

const Code            = require('code');
const expect          = Code.expect;
const Sinon           = require('sinon');
const Proxyquire      = require('proxyquire').noCallThru();
const loggerClassPath = '../../lib/internals/logger';
const tokiLoggerName  = require(loggerClassPath).constants.LOGGER_MODULE;

describe('logger tests', () => {

    let Logger;

    const infoSpy  = Sinon.spy();
    const debugSpy = Sinon.spy();
    const errorSpy = Sinon.spy();

    class TokiLoggerStub {

        info(...args) {

            infoSpy();
        }

        debug(...args) {

            debugSpy();
        }

        error(...args) {

            errorSpy();
        }
    }

    class TokiLoggerProxy {

        constructor() {

            this[tokiLoggerName] = new TokiLoggerStub();
        }
    }

    class LoggerStub {

        constructor(stubs) {

            if (!stubs) {
                stubs = new TokiLoggerProxy();
            }

            return Proxyquire(loggerClassPath, stubs);
        }
    }

    beforeEach((done) => {

        Logger = new LoggerStub();

        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();
        done();
    });

    it('should throw if toki-logger not installed', (done) => {

        Logger = new LoggerStub({});

        expect(() => {

            new Logger();
        }).to.throw('Cannot find module \'' + tokiLoggerName + '\'');
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
