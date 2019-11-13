//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
supertest = require('supertest');

chai.use(chaiHttp);
describe('health route', () => {
    it('it should return the health check post', (done) => {
        chai.request(server)
            .get('/health')
            .end((err, res) => {
                res.should.have.status(200);
                res.body[0].storyid.should.be.eq('7d7c6600-fb54-11e9-93cf-67d480eb30ad');
                done();
            });
    });
});