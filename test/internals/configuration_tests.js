'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it       = lab.it;

const Code             = require('code');
const expect           = Code.expect;
const Promise          = require('bluebird');
const Proxyquire       = require('proxyquire').noCallThru();
const EventEmitter     = require('events');
const configModulePath = '../../lib/internals/configuration';

describe('configuration tests', () => {

    let Configuration;

    it('should throw if no chronos-config installed', (done) => {

        Configuration = Proxyquire(configModulePath, {});

        expect(() => {

            return new Configuration();
        }).to.throw('Cannot find module \'chronos-config\'');
        done();
    });

    it('should create instance', (done) => {

        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on: () => {

                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('"chronos configuration" is required');
            });
    });

    it('should throw if routes are missing', () => {

        const config  = {};
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "path" fails because ["path" is not allowed to be empty]]]');
            });
    });

    it('should throw if route.httpAction invalid', () => {

        const config = {
            routes: [
                {
                    path      : 'path',
                    httpAction: 'httpAction'
                }
            ]
        };

        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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
        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

        const instance = new Configuration();
        expect(instance).to.be.an.object();
        return instance.getConfiguration()
            .catch((error) => {

                expect(error).to.exist();
                expect(error.message).to.equal('child "routes" fails because ["routes" at position 0 fails because [child "actions" fails because ["actions" at position 0 does not match any of the allowed types]]]');
            });
    });

    it('should pass validation with sequential actions', () => {

        const config = {
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

        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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

        const config = {
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

        Configuration = Proxyquire(configModulePath, {
            'chronos-config': {
                on : () => {

                },
                get: () => {

                    return Promise.resolve(config);
                }
            }
        });

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

        class ChronosConfig extends EventEmitter {
        }
        const chronosConfig = new ChronosConfig();

        Configuration = Proxyquire(configModulePath, {
            'chronos-config': chronosConfig
        });

        const instance = new Configuration();
        expect(instance).to.be.an.object();

        instance.on(Configuration.constants.CONFIG_CHANGED_EVENT, () => {

            done();
        });

        chronosConfig.emit(Configuration.constants.CONFIG_CHANGED_EVENT);
    });
});
