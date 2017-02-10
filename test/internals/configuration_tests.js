'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const before     = lab.before;
const it       = lab.it;

const Code            = require('code');
const expect          = Code.expect;
const Sinon           = require('sinon');
const Promise         = require('bluebird');
const Proxyquire      = require('proxyquire').noCallThru();
const EventEmitter    = require('events');
const configClassPath = '../../lib/internals/configuration';
const tokiConfigName  = require(configClassPath).constants.CONFIG_MDDULE;
const tokiLoggerName  = require('../../lib/internals').logger.constants.LOGGER_MODULE;

describe('configuration tests', () => {

    let Configuration;

    const infoSpy  = Sinon.spy();
    const debugSpy = Sinon.spy();
    const errorSpy = Sinon.spy();

    class TokiLoggerStub {

        info(...args) {

            console.log(args);
            infoSpy();
        }

        debug(...args) {

            console.log(args);
            debugSpy();
        }

        error(...args) {

            console.log(args);
            errorSpy();
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

    class TokiConfig extends EventEmitter {

        constructor(config) {

            super();

            this.config = config;
        }

        get() {

            return Promise.resolve(this.config);
        }
    }

    class TokiConfigStub {

        constructor(config) {

            this[tokiConfigName] = new TokiConfig(config);
        }

        get stub() {

            return this[tokiConfigName];
        }
    }

    class ConfigurationStub {

        constructor(config) {

            const proxy = new TokiConfigStub(config);

            const stubs = Object.assign({},
                proxy,
                new LoggerProxy('./logger')
            );

            return Object.assign(Proxyquire(configClassPath, stubs), {
                stub: proxy.stub
            });
        }
    }

    before((done) => {

        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();
        done();
    });

    it('should throw if toki-config not installed', (done) => {

        Configuration = Proxyquire(configClassPath, {});

        expect(() => {

            return new Configuration();
        }).to.throw('Cannot find module \'' + tokiConfigName + '\'');
        done();
    });

    it('should create instance', (done) => {

        Configuration = new ConfigurationStub();

        let instance;
        expect(() => {

            instance = new Configuration();
        }).to.not.throw();

        expect(instance).to.be.an.object();
        expect(instance.getConfiguration).to.be.a.function();
        done();
    });

    it('should throw if configuration is empty', () => {

        const config  = undefined;
        Configuration = new ConfigurationStub(config);

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('"toki configuration" is required');
            });
    });

    it('should throw if routes are missing', () => {

        const config  = {};
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "path" fails because ["path" is not allowed to be empty]]]');
            });
    });

    it('should throw if route.httpAction invalid', () => {

        const config  = {
            routes: [
                {
                    path      : 'path',
                    httpAction: 'httpAction'
                }
            ]
        };
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

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
        Configuration = new ConfigurationStub(config);

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" at position 0 does not match any of the allowed types]]]');
            });
    });

    it('should pass validation with sequential actions', () => {

        const config  = {
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
        Configuration = new ConfigurationStub(config);

        const instance = new Configuration();
        expect(instance).to.be.an.object();

        return instance.getConfiguration()
            .then((result) => {

                expect(result).to.be.an.object();
                expect(result.routes).to.exist().and.be.an.array();

                expect(instance.value).to.be.an.object();
                expect(instance.value.routes).to.exist().and.be.an.array();
            });
    });

    it('should pass validation with parallel actions', () => {

        const config  = {
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
        Configuration = new ConfigurationStub(config);

        const instance = new Configuration();
        expect(instance).to.be.an.object();

        return instance.getConfiguration()
            .then((result) => {

                expect(result).to.be.an.object();
                expect(result.routes).to.exist().and.be.an.array();

                expect(instance.value).to.be.an.object();
                expect(instance.value.routes).to.exist().and.be.an.array();
            });
    });

    it('should handle config_changed event', (done) => {

        Configuration = new ConfigurationStub();

        const instance = new Configuration();
        expect(instance).to.be.an.object();

        instance.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

            done();
        });

        Configuration.stub.emit(Configuration.constants.CONFIG_CHANGED_EVENT);
    });
});
