var events = require('events')
  , util = require('util')
  , Report = require('./report')
  , app = require('./../app')
  ;

exports = module.exports = Monitor;
exports.Report = Report;

/**
 * Attaches itself to a bus.io instance and reports on the events
 *
 * @return Monitor
 */

function Monitor (options) {

  if (!(this instanceof Monitor)) return new Monitor(options);

  options = options || {};
  options.actor = options.actor || 'monitor';
  options.action = options.action || 'monitor-report';
  options.target = options.target || 'monitor';
  options.interval = options.interval || 1000;

  function monitor (bus) {
    monitor.middleware(bus);
  }

  events.EventEmitter.call(monitor);

  monitor.__proto__ = Monitor.prototype;

  monitor.options = options;

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

  /**
   * Populates the report with data we receive
   *
   * @param {Array} data
   */

  monitor.onData = function (data) {
    monitor.report().populate(data);
  };

  monitor.on('data', monitor.onData);

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
  var options = this.options;
  bus.incomming().use(this.onIncomming).addListener('consumed', this.onIncommingConsumed);
  bus.processing().use(this.onProcessing).addListener('consumed', this.onProcessingConsumed);
  bus.outgoing().use(this.onOutgoing).addListener('consumed', this.onOutgoingConsumed);
  this.on('report', function (report) {
    if (!report) return;
    bus.message()
      .actor(options.actor)
      .target(options.target)
      .action(options.action)
      .content(report.data())
      .deliver();
  });
  this.setInterval();
};

/**
 * Grabs the report
 *
 * @param {Report} optional*
 * @return Monitor / Report
 */

Monitor.prototype.report = function (report) {
  if (report) {
    this._report = report;  
    return this;
  }
  if (typeof this._report !== 'object' || (!(this._report instanceof Report))) {
    this.report(Report());
  }
  return this._report;
};

/**
 * Publishes the report as a message and sets a new one
 *
 * @return Monitor
 */

Monitor.prototype.tick = function () {
  var report = this.report();
  this.report(Report());
  this.emit('report', report);
  return this;
};

/**
 * initialize the app
 *
 * @return Server
 */

Monitor.prototype.app = function () {
  return require('./../app');
};

/**
 * Sets the interval
 *
 * @return TimeoutObject
 */

Monitor.prototype.setInterval = function () {
  var self = this;
  if (!this._timeout) {
    this._timeout = setInterval(function () {
      self.tick();
    }, this.options.interval)
  }
  return this._timeout; 
};

/**
 * Clears the interval
 *
 * @return Monitor
 */

Monitor.prototype.clearInterval = function () {
  if (this._timeout) {
    clearInterval(this._timeout);
    this._timeout = null;
  }
  return this;
};
