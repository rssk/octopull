'use strict';

var chai = require('chai');

// Decorate all objects and primitives with a `.should` method
chai.should();

describe('Array', function() {
    describe('#indexOf()', function() {
        var testArray;
        beforeEach('prepare test array', function () {
            testArray = [1, 2, 3];
        });
        it('should return the index when the value is present', function() {
            testArray.indexOf(1).should.equal(0);
            testArray.indexOf(2).should.equal(1);
            testArray.indexOf(3).should.equal(2);
        });
        it('should return -1 when the value is not present', function() {
            testArray.indexOf(5).should.equal(-1);
            testArray.indexOf(0).should.equal(-1);
        });
        it('silly async test', function(done) {
            process.nextTick(function() {
                //this is async
                done();
            });
        });
    });
});
