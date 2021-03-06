'use strict';

var PublisherRoutePattern = require('../../lib/route-patterns/publisher-route-pattern.js');

var Promise = require('bluebird');

var chai = require('chai');
var expect = chai.expect;

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

chai.use(require('chai-as-promised'));

describe('PublisherRoutePattern', function() {
  describe('default construction', function() {
    var routePattern;

    beforeEach(function(){
      routePattern = new PublisherRoutePattern();
    });

    it('should use the topic exchange type', function() {
      expect(routePattern.exchangeType).to.eq('topic');
    });
  });

  describe('construction options', function() {
    it('should use the exchange type passed in the options', function() {
      var routePattern = new PublisherRoutePattern({
        exchangeType: 'headers'
      });

      expect(routePattern.exchangeType).to.eq('headers');
    });
  });

  describe('createTopology', function() {
    var mockTopology;
    var routePattern;

    beforeEach(function() {
      mockTopology = {
        createExchange: function() {
          return Promise.resolve();
        }
      };

      routePattern = new PublisherRoutePattern();
    });

    it('should assert an exchange with a conventional name and the specified type', function() {
      sinon.spy(mockTopology, 'createExchange');

      return routePattern.createTopology(mockTopology, 'my-domain', 'my-app', 'my-route').then(function(){
        expect(mockTopology.createExchange).to.have.been.calledWith({
          name: 'my-domain.my-app.my-route',
          type: routePattern.exchangeType,
          durable: true
        });
      });
    });

    it('should return the name of the exchange it created', function() {
      var p = routePattern.createTopology(mockTopology, 'my-domain', 'my-app', 'my-route');

      return expect(p).to.eventually.eql({ exchangeName: 'my-domain.my-app.my-route' });
    });

    it('should reject if the exchange cannot be created', function() {
      mockTopology.createExchange = function() {
        return Promise.reject(new Error('Shoot!'));
      };

      return expect(routePattern.createTopology(mockTopology, 'my-domain', 'my-app', 'my-route')).to.be.rejectedWith('Shoot!');
    });
  });
});
