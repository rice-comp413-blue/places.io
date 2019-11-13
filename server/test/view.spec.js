//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
supertest = require('supertest');

chai.use(chaiHttp);
describe('view route', () => {
    it('it should get posts correctly', (done) => {
        chai.request(server)
            .post('/view')
            .send({"latlng1": [20, -50], "latlng2": [-50, 90]})
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
    it('it should GET 5 posts', (done) => {
        chai.request(server)
            .post('/view')
            .send({"latlng1": [20, -50], "latlng2": [-50, 90], "pagelimit": 5})
            .end((err, res) => {
                res.body.entries.length.should.be.eql(5);
                done();
            });
    });
    it('it should return id 3', (done) => {
        chai.request(server)
            .post('/view')
            .send({"latlng1": [20, -50], "latlng2": [-50, 90], "id": 3})
            .end((err, res) => {
                res.body.id.should.be.eq(3);
                done();
            });
    });
});