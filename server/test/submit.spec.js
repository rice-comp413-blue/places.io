//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
supertest = require('supertest');

chai.use(chaiHttp);
describe('submit route', () => {
    it('it should submit a post', (done) => {
        chai.request(server)
            .post('/submit')
            .field('text', 'test')
            .field('timestamp', 'Wed, 16 Oct 2019')
            .field('lat', '9')
            .field('lng', '9')
            .end((err, res) => {
                res.should.have.status(201);
                res.text.should.be.eq('Successfully posted a story without image.');
                done();
            });
    });
});