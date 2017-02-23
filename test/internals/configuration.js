'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const beforeEach = lab.beforeEach;
const it         = lab.it;

const Code   = require('code');
const expect = Code.expect;
const Sinon  = require('sinon');
const Stubs  = require('../stubs').Configuration;

describe('configuration tests', () => {

    let Configuration;

    const infoSpy  = Sinon.spy();
    const debugSpy = Sinon.spy();
    const errorSpy = Sinon.spy();

    class ConfigurationStub {

        constructor(config) {

            const options = {
                TokiConfigProxy: {
                    config
                },
                LoggerProxy    : {
                    path : './logger',
                    spies: {
                        infoSpy,
                        debugSpy,
                        errorSpy
                    }
                }
            };

            return new Stubs.ConfigurationStub(options);
        }
    }

    beforeEach((done) => {

        infoSpy.reset();
        debugSpy.reset();
        errorSpy.reset();
        done();
    });

    it('should succeed requiring toki-config', (done) => {

        const TokiConfig = require('toki-config');
        new TokiConfig({
            'toki-config-file': {
                foo: 'bar'
            }
        });

        Configuration = require('../../lib/internals').configuration;

        expect(() => {

            return new Configuration();
        }).to.not.throw();
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

        Configuration.tokiConfig.stub.emit(Configuration.constants.CONFIG_CHANGED_EVENT);
    });
});
