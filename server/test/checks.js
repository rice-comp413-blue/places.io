// TODO: During the test the env variable is set to test
// process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Stories', () => {
  /*
  * Test the /POST route
  */
  describe('/POST view', () => {
      it('it should not POST a view without latlng2 field', (done) => {
          let view = {
            "latlng1": [20, 0],
            // "latlng2": [0, 80]
        }
        chai.request(server)
            .post('/view')
            .send(view)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.property('errors');
              done();
            });
      });

  });
});
