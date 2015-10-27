'use strict';

var assert = require('assert-plus');
var util = require('util');

var Subscriber = require('./subscriber');
var Receiver = require('./receiver');
var WorkerRoutePattern = require('./route-patterns/worker-route-pattern');
var EventDispatcher = require('./event-dispatcher.js');

module.exports = SubscriberShim;

/**
 * Backwards-Compatibility shim for {@link Subscriber} - allows Construction with {@link Broker} and options
 *
 * @constructor
 * @private
 */
function SubscriberShim(receiver, options){
  assert.object(receiver);

  assert.optionalObject(options);
  options = options || {};
  assert.optionalString(options.routeName, 'options.routeName');
  assert.optionalString(options.routePattern, 'options.routePattern');

  if (!(receiver instanceof Receiver)){
    //assume receiver is a Broker instance
    var opts = {};
    opts.routeName = options.routeName || 'subscribe';
    opts.routePattern = options.routePattern || new WorkerRoutePattern();
    opts.envelope = options.envelope;
    receiver = new Receiver(receiver, opts);
  }

  Subscriber.call(this, receiver, new EventDispatcher());
}
util.inherits(SubscriberShim, Subscriber);