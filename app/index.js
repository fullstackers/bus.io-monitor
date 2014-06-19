/*
 * Get our express app up and running as a static resource provider
 */

var express = require('express');
var app = express();
app.use(express.static(__dirname+'/public'));

/*
 * Create the http server, and if we are not being included
 * from another module, start the server.
 */

var server = require('http').Server(app);
if (~module.parent) server.listen(3000);

/*
 * Create our bus.io instance, a timeline object to hold
 * our data, and a monitor object.  If this file is not
 * being included from another module, tell the bus.io
 * instance to use the monitor.
 */

var bus = require('bus.io')(server);
var Monitor = require('./..');
var monitor = Monitor();
var actor = 'reportViewer';
var timeline = Timeline(120);

if (~module.parent) bus.use(monitor);

/*
 * IF the client sends us any message, lets assume that the actor
 * is everyone and the target is everyone. We also want to deliver
 * to the client our current timeline.
 */

bus.actor(function (socket, cb) { cb(null, actor); });
bus.target(function (socket, params, cb) { cb(null, actor); });
bus.socket(function (socket) { socket.emit('timeline', timeline.report.data(), timeline.counts, timeline.deltas, timeline.max); });

/*
 * Whenever we get a monitor-report action, take the message
 * content and turn it into a report.  Once we convert it
 * to a report, lets merge this new report into our report object.
 */

bus.on(monitor.options.action, function (message) {
  timeline.current.combine(Monitor.Report(message.content()))
  message.deliver();
});

/*
 * Every interval lets take our current report, diff it from our
 * last report. We will then emit the diff, and reset the current
 * report. We will also send out the current report
 */

setInterval(function () {
  var count = timeline.current;
  var delta = count.diff(Monitor.Report(timeline.counts[timeline.counts.length-1]));
  if (timeline.counts.length >= timeline.max) timeline.counts.shift();
  if (timeline.deltas.length >= timeline.max) timeline.deltas.shift();
  timeline.counts.push(count.data());
  console.log('count', count.data());
  timeline.deltas.push(delta.data());
  console.log('delta', delta.data());
  timeline.report.combine(count);
  timeline.current = Monitor.Report();
  bus.message().actor(monitor.options.actor).action('delta').target(actor).content(delta.data()).deliver();
  bus.message().actor(monitor.options.actor).action('count').target(actor).content(count.data()).deliver(); 
}, monitor.options.interval);

module.exports = server;

// TODO refactor!
function Timeline (max) {
  if (!(this instanceof Timeline)) return new Timeline(max);
  this.report = Monitor.Report();
  this.current = Monitor.Report();
  this.deltas = [];
  this.counts = [];
  this.max = max;
  for (var i=0; i<max; i++) {
    this.deltas[i] = {};
    this.counts[i] = {};
  }
}
