'use strict';

// const Lab = require('lab');
// const lab = exports.lab = Lab.script();
// const describe   = lab.describe;
// const beforeEach = lab.beforeEach;
// const it         = lab.it;

const Code           = require('code');
const expect         = Code.expect;
const Sinon          = require('sinon');
const Exceptions     = require('../../lib/exceptions');
const Stubs          = require('../stubs').RouteBuilder;

describe('routes builder tests', () => {

    let RouteBuilder;
    let router;
    let routerStub;

    const infoSpy  = Sinon.spy();
    const debugSpy = Sinon.spy();
    const errorSpy = Sinon.spy();

    beforeEach((done) => {

        const handler = (url, handlerFunc) => {
        };

        const loggerOptions = {
            path : './logger',
            spies: {
                infoSpy,
                debugSpy,
                errorSpy
            }
        };

        RouteBuilder = new Stubs.RouteBuilderStub({
            RouteHandlerProxy: {
                path       : './routeHandler',
                LoggerProxy: loggerOptions
            },
            LoggerProxy      : loggerOptions
        });

        router = {
            get   : handler,
            post  : handler,
            put   : handler,
            delete: handler,
            patch : handler
        };

        routerStub = Sinon.stub(router);
        done();
    });

    it('should build routes om some http methods', (done) => {

        const input = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET'
                },
                {
                    path      : 'route2',
                    httpAction: 'POST'
                }
            ],
            router: routerStub
        };

        RouteBuilder.build(input);

        expect(routerStub.get.calledOnce).to.be.true();
        expect(routerStub.get.calledWith('route1')).to.be.true();
        expect(routerStub.post.calledOnce).to.be.true();
        expect(routerStub.post.calledWith('route2')).to.be.true();
        expect(routerStub.put.calledOnce).to.be.false();
        expect(routerStub.delete.calledOnce).to.be.false();
        expect(routerStub.patch.calledOnce).to.be.false();
        done();
    });

    it('should build routes on dupe methods', (done) => {

        const input = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET'
                },
                {
                    path      : 'route2',
                    httpAction: 'GET'
                }
            ],
            router: routerStub
        };

        RouteBuilder.build(input);

        expect(routerStub.get.calledTwice).to.be.true();
        expect(routerStub.get.calledWith('route1')).to.be.true();
        expect(routerStub.get.calledWith('route2')).to.be.true();
        expect(routerStub.post.calledOnce).to.be.false();
        expect(routerStub.put.calledOnce).to.be.false();
        expect(routerStub.delete.calledOnce).to.be.false();
        expect(routerStub.patch.calledOnce).to.be.false();
        done();
    });

    it('should build routes on all http methods', (done) => {

        const input = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'GET'
                },
                {
                    path      : 'route2',
                    httpAction: 'POST'
                },
                {
                    path      : 'route3',
                    httpAction: 'PUT'
                },
                {
                    path      : 'route4',
                    httpAction: 'DELETE'
                },
                {
                    path      : 'route5',
                    httpAction: 'PATCH'
                },
                {
                    path      : 'route6',
                    httpAction: 'PATCH'
                },
                {
                    path      : 'route7',
                    httpAction: 'PATCH'
                }
            ],
            router: routerStub
        };

        RouteBuilder.build(input);

        expect(routerStub.get.calledOnce).to.be.true();
        expect(routerStub.get.calledWith('route1')).to.be.true();
        expect(routerStub.post.calledOnce).to.be.true();
        expect(routerStub.post.calledWith('route2')).to.be.true();
        expect(routerStub.put.calledOnce).to.be.true();
        expect(routerStub.put.calledWith('route3')).to.be.true();
        expect(routerStub.delete.calledOnce).to.be.true();
        expect(routerStub.delete.calledWith('route4')).to.be.true();
        expect(routerStub.patch.calledThrice).to.be.true();
        expect(routerStub.patch.calledWith('route5')).to.be.true();
        done();
    });

    it('should throw on unknown httpAction', (done) => {

        const input = {
            routes: [
                {
                    path      : 'route1',
                    httpAction: 'AYNO'
                }
            ],
            router: routerStub
        };

        expect(() => {

            RouteBuilder.build(input);
        }).to.throw(Exceptions.InvalidRouteHttpAction);
        done();
    });
});
