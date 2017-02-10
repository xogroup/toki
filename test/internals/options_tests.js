'use strict';

// const Lab = require('lab');
// const lab = exports.lab = Lab.script();
// const describe   = lab.describe;
// const before     = lab.before;
// const it         = lab.it;

const Code      = require('code');
const expect    = Code.expect;
const Internals = require('../../lib/internals');

describe('options tests', () => {

    let Options;

    before((done) => {

        Options = Internals.options;
        done();
    });

    it('should throw if no options supplied', (done) => {

        const input = undefined;
        expect(() => {

            return new Options(input);
        }).to.throw('"options object" is required');
        done();
    });

    it('should throw if options.router missing', (done) => {

        const input = {};
        expect(() => {

            return new Options(input);
        }).to.throw('child "router object" fails because ["router object" is required]');
        done();
    });

    it('should throw if options.router empty', (done) => {

        const input = {
            router: {}
        };
        expect(() => {

            return new Options(input);
        }).to.throw('child "router object" fails because [child "get" fails because ["get" is required]]');
        done();
    });

    it('should throw if options.router.get not a function', (done) => {

        const input = {
            router: {
                get: {}
            }
        };
        expect(() => {

            return new Options(input);
        }).to.throw('child "router object" fails because [child "get" fails because ["get" must be a Function]]');
        done();
    });

    it('should throw if options.router.get function missing expected args', (done) => {

        const input = {
            router: {
                get: () => {
                }
            }
        };
        expect(() => {

            return new Options(input);
        }).to.throw('child "router object" fails because [child "get" fails because ["get" must have an arity of 2]]');
        done();
    });

    it('should pass options.router.get not a function', (done) => {

        const input = {
            router: {
                get   : (a, b) => {
                },
                post  : (a, b) => {
                },
                put   : (a, b) => {
                },
                delete: (a, b) => {
                },
                patch : (a, b) => {
                }
            }
        };

        const options = new Options(input);
        expect(options).to.be.an.object();
        expect(options.value).to.be.an.object();
        expect(options.value.router).to.exist().and.be.an.object();
        done();
    });
});
