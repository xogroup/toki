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

describe('chronos', () => {

    let Chronos;

    beforeEach(() => {
        Chronos = Proxyquire('../lib', {
            'chronos-config': function() {
                return {};
            }
        });
    });

    it('should throw error when no options passed', () => {

        const options = undefined;
        expect(() => {

            return new Chronos(options);
        }).to.throw('\"options\" is required');
    });

    it('should throw error when invalid options passed', () => {

        const options = {};
        expect(() => {

            return new Chronos(options);
        }).to.throw('child "configuration module name" fails because ["configuration module name" is required]');
    });

    it('should throw error when not installed config module name passed', () => {

        const options = {
            config: 'not-here'
        };
        expect(() => {

            return new Chronos(options);
        }).to.throw('Cannot find module \'not-here\'');
    });

    it('should throw error when module config returns invalid config', () => {

        const options = {
            config: 'chronos-config'
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

    it('should get a chronos instance', () => {

        const options = {
            config: 'chronos-config'
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
                    httpAction: 'GET',
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
        expect(chronos.route1).to.exist().and.be.a.function();
        expect(chronos.route2).to.exist().and.be.a.function();

        const response1 = Sinon.spy();
        const response2 = Sinon.spy();

        return Promise.join(
            chronos.route1({}, response1),
            chronos.route2({}, response2), (value1, value2) => {
                expect(response1.called).to.be.true();
                expect(response2.called).to.be.true();
            }
        );
    });
});
