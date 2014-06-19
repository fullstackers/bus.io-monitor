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
 * Create our bus.io instance, a report object to hold
 * our data, and a monitor object.  If this file is not
 * being included from another module, tell the bus.io
 * instance to use the monitor.
 */

var bus = require('bus.io')(server);
var Monitor = require('./..');
var monitor = Monitor();
var timeline = { report: Monitor.Report(), current: Monitor.Report(), diffs: [Monitor.Report().data()], max: 360 };

if (~module.parent) bus.use(monitor);

/*
 * IF the client sends us any message, lets assume that the actor
 * is everyone and the target is everyone. We also want to deliver
 * to the client our current timeline.
 */

var actor = 'reportViewer';

bus.actor(function (socket, cb) { cb(null, actor); });
bus.target(function (socket, params, cb) { cb(null, actor); });
bus.socket(function (socket) { socket.emit('timeline', timeline.report.data(), timeline.diffs); });

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
 * report.
 */

setInterval(function () {
  if (timeline.diffs.length >= timeline.max) timeline.diffs.shift();
  var diff = timeline.current.diff(Monitor.Report(timeline.diffs[timeline.diffs.length-1]));
  timeline.current = Monitor.Report();
  timeline.diffs.push(diff.data());
  timeline.report.combine(diff);
  bus.message()
    .actor(monitor.options.actor)
    .action('update')
    .target(actor)
    .content(diff.data())
    .deliver();
}, monitor.options.interval);

module.exports = server;
