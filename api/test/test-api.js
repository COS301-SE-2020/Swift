'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiMatchPattern = require('chai-match-pattern');
const server = require('../server');

// Assertion tests
chai.should();
chai.use(chaiHttp);
chai.use(chaiMatchPattern);

describe('Test API Endpoints', () => {
    /**
     * Test DELETE API
     */
    it("DELETE Endpoint", (done) => {
        const jsonPattern = `{
            "request": "DELETE",
            "response": "DELETE -> Swift API :)",
            "user_agent": /./
        }`;
        chai.request(server)
        .delete('/')
        .end((err, res) => {
            res.should.have.status(200);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });

    /**
     * Test GET API
     */
    it("GET Endpoint", (done) => {
        const jsonPattern = `{
            "request": "GET",
            "response": "GET -> Swift API :)",
            "user_agent": /./
        }`;
        chai.request(server)
        .get('/')
        .end((err, res) => {
            res.should.have.status(200);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });

    /**
     * Test POST API
     */
    it("POST Endpoint - Bad Request", (done) => {
        const jsonPattern = `{
            "status": 400,
            "reason": "Bad Request"
        }`;
        chai.request(server)
        .post('/')
        .end((err, res) => {
            res.should.have.status(400);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });

    it("POST Endpoint - Invalid Email", (done) => {
        const jsonPattern = `{
            "status": 403,
            "reason": "Invalid Email"
        }`;
        chai.request(server)
        .post('/')
        .send({"requestType": "register", "name": "John", "surname": "Doe", "username": "john.doe", "email": "john.doe.com", "password": "john123"})
        .end((err, res) => {
            res.should.have.status(400);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });

    it("POST Endpoint - Unauthorised Access", (done) => {
        const jsonPattern = `{
            "status": 401,
            "reason": "Unauthorised Access"
        }`;
        chai.request(server)
        .post('/')
        .send({"requestType": "allRestaurants", "token": "notoken"})
        .end((err, res) => {
            res.should.have.status(401);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });

    /**
     * Test PUT API
     */
    it("PUT Endpoint", (done) => {
        const jsonPattern = `{
            "request": "PUT",
            "response": "PUT -> Swift API :)",
            "user_agent": /./
        }`;
        chai.request(server)
        .put('/')
        .end((err, res) => {
            res.should.have.status(200);
            res.type.should.equal("application/json");
            res.body.should.matchPattern(jsonPattern);
            done();
        });
    });
});
