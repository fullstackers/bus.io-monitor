var memwatch = require('memwatch');
memwatch.on('leak', function (leak) { console.log('leak', leak) });
memwatch.on('stats', function (stats) { console.log('stats', stats) });
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
var report = Monitor.Report();

if (~module.parent) bus.use(monitor);

/*
 * IF the client sends us any message, lets assume that the actor
 * is everyone and the target is everyone.
 */

var actor = 'reportViewer';

bus.actor(function (socket, cb) { cb(null, actor); });
bus.target(function (socket, params, cb) { cb(null, actor); });

/*
 * Whenever we get a monitor-report action, take the message
 * content and turn it into a report.  Once we convert it
 * to a report, lets merge this new report into our report object.
 */

bus.on(monitor.options.action, function (message) {
  report.combine(Monitor.Report(message.content()))
  message.deliver();
});

/*
 * Every interval lets take our current report and deliver it
 * to everyone.
 */

setInterval(function () {
  bus.message()
    .actor(monitor.options.actor)
    .action('update')
    .target(actor)
    .content(report.data())
    .deliver();
}, monitor.options.interval);

module.exports = server;
