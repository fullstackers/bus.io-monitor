var events = require('events')
  , util = require('util');

module.exports = Monitor;

/**
 * Attaches itself to a bus.io instance and reports on the events
 *
 * @return Monitor
 */

function Monitor () {

  if (!(this instanceof Monitor)) return new Monitor();

  function monitor (bus) {
    monitor.middleware(bus);
  }

  events.EventEmitter.call(monitor);

  monitor.__proto__ = Monitor.prototype;

  /**
   * Triggers a "data" event whenver we receive a message going into the bus
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onIncomming = function (message, socket, next) {
    monitor.emit('data', ['in', message.actor(), message.action(), message.target()]);
    next();
  };

  /**
   * Triggers a "data" event whenver we receive a message being handled on the bus
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onProcessing = function (message, next) {
    monitor.emit('data', ['on', message.actor(), message.action(), message.target()]);
    next();
  };

  /**
   * Triggers a "data" event whenver we receive a message going to the socket
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onOutgoing = function (message, socket, next) {
    monitor.emit('data', ['out', message.actor(), message.action(), message.target()]);
    next();
  };

  /**
   * Triggers a "data" event whenver we receive a message going into the bus
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onIncommingConsumed = function (message) {
    monitor.emit('data', ['inc', message.actor(), message.action(), message.target()]);
  };

  /**
   * Triggers a "data" event whenver we receive a message being handled on the bus
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onProcessingConsumed = function (message) {
    monitor.emit('data', ['onc', message.actor(), message.action(), message.target()]);
  };

  /**
   * Triggers a "data" event whenver we receive a message going to the socket
   *
   * @param {Message} message
   * @param {Socket} socket
   * @param {Function} next
   */

  monitor.onOutgoingConsumed = function (message) {
    monitor.emit('data', ['outc', message.actor(), message.action(), message.target()]);
  };

  return monitor;

}

util.inherits(Monitor, events.EventEmitter);

/**
 * The middleware function for this monitor.  It will bind handlers for tracking
 * messages.
 *
 * @param {Bus} bus
 */

Monitor.prototype.middleware = function (bus) {
  bus.incomming().use(this.onIncomming).addListener('consumed', this.onIncommingConsumed);
  bus.processing().use(this.onProcessing).addListener('consumed', this.onProcessingConsumed);
  bus.outgoing().use(this.onOutgoing).addListener('consumed', this.onOutgoingConsumed);
};
