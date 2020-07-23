const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiMatchPattern = require('chai-match-pattern');
const server = require('../server');
const { generateToken } = require('../api/helper/tokenHandler');

// Assertion tests
chai.should();
chai.use(chaiHttp);
chai.use(chaiMatchPattern);

describe('Test API Endpoints', () => {
  /**
     * Favicon request
     */
  it('Favicon Request', (done) => {
    chai.request(server)
      .get('/favicon.ico')
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });

  /**
     * Test DELETE API
     */
  it('DELETE Endpoint', (done) => {
    const jsonPattern = '{"whoami": "Swift API :)"}';
    chai.request(server)
      .delete('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
     * Test GET API
     */
  it('GET Endpoint', (done) => {
    const jsonPattern = '{"whoami": "Swift API :)"}';
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
     * Test POST API
     */
  it('POST Endpoint - Bad Request', (done) => {
    const jsonPattern = `{
            "status": 400,
            "reason": "Bad Request"
        }`;
    chai.request(server)
      .post('/')
      .end((err, res) => {
        res.should.have.status(400);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  it('POST Endpoint - Invalid Email', (done) => {
    const jsonPattern = `{
            "status": 400,
            "reason": "Bad Request"
        }`;
    chai.request(server)
      .post('/')
      .send({
        requestType: 'register',
        name: 'John',
        surname: 'Doe',
        username: 'john.doe',
        email: 'john.doe.com',
        password: 'john123'
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  it('POST Endpoint - Unauthorised Access', (done) => {
    const jsonPattern = `{
            "status": 401,
            "reason": "Unauthorised Access"
        }`;
    chai.request(server)
      .post('/')
      .send({
        requestType: 'allRestaurants',
        token: 'notoken'
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
     * Test PUT API
     */
  it('PUT Endpoint', (done) => {
    const jsonPattern = '{"whoami": "Swift API :)"}';
    chai.request(server)
      .put('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
   * Token Refresh Test
   */
  it('Token Refresh Required Test', (done) => {
    const jsonPattern = '{"status": 407, "reason": "Token Refresh Required"}';
    chai.request(server)
      .post('/')
      .send({
        requestType: 'allRestaurants',
        token: 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsImNydiI6IlAtNTIxIiwieCI6IkFkU2trT0JmNkJhVFZqLTZTNFhCUVlFRFh3R1lzVzgxZHNYUnR5QVdSVDNPZUthSTdNcXR5aDV4VmxqMTl4SEhNd0c3MENaQ3FUNGt4VkVJTklNdExPaHkiLCJ5IjoiQU5wb0s5WHcxQ3d6ZVdOUnRpNjZTYk5uWGhXMzhBbG40cUVHWkdGdXN6Z1ByNVpHTVNNbVYtbXVmdDFTem5jbmc2azFMNURNMjRrZzRneUVETWFwajRuciJ9fQ..KV21uMipl17WsKkiSzG2xQ.jAg8wgjqoYEBMRlxvXHHxtcNLeeyoHkFKB5ZhcMO0aDI3AOEJWJoW8Lj1bm5tKPRoryr57tvULWHOqDbuohoW9qrtbUyOJES2VNPo7UlSza9lv2XqfeUDZTvYCVh7ZePI2rF5Bo5LjOr2-NR7hYQ0pbnDTFuTdaw-ppu6bRQTE9JS7O7GMVwIy5g1_fDfopgVewortMI-kvd-WsgD6SkwNlYPDsyAzTbkpaovIZrAIfsmPRXyLitYLK9lVH3RMVArDh-k8sq1usM4b4hi9VgMYb_xobp0slrsBhVwiwcSUHowCCeMcIa8W8pyDp-As_CUJwI7SqqOaSMA3_gGWNWgp8F6pZUGA8h4aMrz3i66nUO06Y3lCl6iKijL0AP_4vc2I9zH5Aivfh4rRysUGCof1N3jcm948enPiGbCCuwXQsYxL4F6sNmIoQ5lLFv4Meq4anSQQwXVKNWaatNEY_GcLVtVpiStUCyHuxj2DjPDXOxnygSe1H9_DUgWf9lpzatUoU8Pi62HsVkVMSFNenFSlXKPIqbSqi9KE5fJ-uGOZHdYVQCr-vKqYjcMLiY7tloKhjI_4zZw0M-sDMfmIRW5ooPi7vNtK2BLjUXfZw6hBVlQz0AMuYBQfVnArsegjO_0Ui0X_ETxXGDc4xuQZWpLg.jHYGJyAPrGPHlDRsPeflKA'
      })
      .end((err, res) => {
        res.should.have.status(407);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
   * Too little request parameters
   */
  it('Too Little Request Paramaters', (done) => {
    const jsonPattern = '{"status": 400, "reason": "Bad Request"}';
    chai.request(server)
      .post('/')
      .send({
        requestType: 'login'
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
   * Too many request parameters
   */
  it('Too Many Request Paramaters', (done) => {
    const jsonPattern = '{"status": 400, "reason": "Bad Request"}';
    chai.request(server)
      .post('/')
      .send({
        requestType: 'login',
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        username: 'john.doe',
        password: 'secretpass'
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
   * Malformed JSON request
   */
  it('Malformed JSON Request', (done) => {
    const jsonPattern = '{"status": 400, "reason": "Bad Request"}';
    chai.request(server)
      .post('/')
      .send({
        requestType: 'login',
        name: 'John',
        // eslint-disable-next-line no-dupe-keys
        name: 'Doe',
        email: 'john@doe.com',
        username: 'john.doe',
        password: 'secretpass'
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.type.should.equal('application/json');
        res.body.should.matchPattern(jsonPattern);
        done();
      });
  });

  /**
   * Test token generation
   */
  it('Token Generation', (done) => {
    const tempToken = generateToken(0);
    tempToken.should.have.property('token');
    tempToken.should.have.property('refreshToken');
    done();
  });
});
