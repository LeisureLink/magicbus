'use strict';

var util = require('util');
var assert = require('assert-plus');
var Producer = require('./producer.js');

module.exports = Sender;

function Sender(broker, options) {
  Producer.call(this, broker, options);

  var routeName = 'send';

  if (options && options.routeName) {
    routeName = options.routeName;
  }

  var route = {};

  Object.defineProperties(route, {
    name: {
      value: routeName,
      enumerable: true
    }
  });

  Object.defineProperties(this, {
    route: {
      value: route,
      enumerable: true
    }
  });
}
util.inherits(Sender, Producer);

Object.defineProperties(Sender.prototype, {
  send: {
    value: function(message, messageType, options) {
      assert.object(message);
      assert.optionalString(messageType);
      assert.optionalObject(options, 'options');
      if (options) {
        assert.optionalString(options.routingKeyPrefix, 'options.routingKeyPrefix');
      }

      var msg = this._getMessage(message, messageType);
      
      //TODO: add middleware execution here

      var routeName = this.route.name;
      var routingKey = this._getRoutingKey(options, messageType);
      var content = this._getSerializedContent(msg.payload);
      var publishOptions = this._getPublishOptions(msg);
      this._broker.publish(routeName, routingKey, content, publishOptions);
    }
  }

});