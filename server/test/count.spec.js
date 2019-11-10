//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
supertest = require('supertest');

chai.use(chaiHttp);
describe('count route', () => {
    it('it should count the number of posts', (done) => {
        chai.request(server)
            .get('/count')
            .send({"latlng1": [20, -50], "latlng2": [-50, 90]})
            .end((err, res) => {
                res.should.have.status(200);
                parseInt(res.body.count).should.be.greaterThan(50);
                done();
            });
    });
});