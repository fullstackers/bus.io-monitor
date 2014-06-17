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

  return monitor;

}

util.inherits(Monitor, events.EventEmitter);

/**
 * The middleware function for this monitor
 *
 * @param {Bus} bus
 */

Monitor.prototype.middleware = function (bus) {

};
