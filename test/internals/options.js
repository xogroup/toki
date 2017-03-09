'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const describe   = lab.describe;
const before     = lab.before;
const it         = lab.it;

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
        }).to.throw();
        done();
    });

    it('should throw if options.router missing', (done) => {

        const input = {};
        expect(() => {

            return new Options(input);
        }).to.throw();
        done();
    });

    it('should throw if options.router empty', (done) => {

        const input = {
            router: {}
        };
        expect(() => {

            return new Options(input);
        }).to.throw();
        done();
    });

    it('should throw if options.router.route is not a function', (done) => {

        const input = {
            router: {
                route: {}
            }
        };
        expect(() => {

            return new Options(input);
        }).to.throw();
        done();
    });

    it('should create a new router', (done) => {

        const input = {
            router: {
                route: (a) => {}
            }
        };

        const options = new Options(input);
        expect(options).to.be.an.object();
        expect(options.value).to.be.an.object();
        expect(options.value.router).to.exist().and.be.an.object();
        done();
    });
});
