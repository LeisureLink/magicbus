'use strict';

var magicbus = require('../lib');
var environment = require('./_test-env');

var chai = require('chai');
var expect = chai.expect;

var PublisherRoutePattern = require('../lib/route-patterns/publisher-route-pattern');
var WorkerRoutePattern = require('../lib/route-patterns/worker-route-pattern');

describe('Broker really using RabbitMQ', function() {
  var serviceDomainName = 'magicbus';
  var appName = 'tests';
  var connectionInfo = environment.rabbitConnectionObject;
  var broker;

  // before(function(){
  //   return magicbus.createBinder(connectionInfo).bind({
  //     serviceDomainName: serviceDomainName,
  //     appName: appName,
  //     name: 'publish',
  //     pattern: new PublisherRoutePattern()
  //   }, {
  //     serviceDomainName: serviceDomainName,
  //     appName: appName,
  //     name: 'subscribe',
  //     pattern: new WorkerRoutePattern()
  //   }, {pattern: '#'});
  // });

  beforeEach(function() {
    broker = magicbus.createBroker(serviceDomainName, appName, connectionInfo);
  });

  afterEach(function() {
    return broker.shutdown();
  });

  it.only('should be able to publish and consume messages', function(done) {
    var theMessage = 'Can I buy your magic bus?';

    var handler = function(msg, ops) {
      var messageContent = new Buffer(msg.content).toString();
      expect(messageContent).to.eq(theMessage);

      ops.ack()
      done();
    };

    broker.registerRoute('publish', new PublisherRoutePattern());
    broker.registerRoute('subscribe', new WorkerRoutePattern());

    broker.consume('subscribe', handler).then(function() {
      broker.publish('publish', 'succeed', new Buffer(theMessage));
    });
  });

  it('should be able to nack messages and have them end up in a failed queue', function(done) {
    var theMessage = 'Can I buy your magic bus?';

    var handler = function(msg) {
      broker.nack('subscribe', msg, false, false).then(function() {
        done();
      });
    };

    broker.registerRoute('publish', new PublisherRoutePattern());
    broker.registerRoute('subscribe', new WorkerRoutePattern());

    broker.consume('subscribe', handler).then(function() {
      broker.publish('publish', 'fail', new Buffer(theMessage));
    });
  });
});
