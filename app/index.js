var express = require('express');
var app = express();

app.use(express.static(__dirname+'/public'));

var server = require('http').Server(app);
if (~module.parent) server.listen(3000);

var bus = require('bus.io')(server);
var Monitor = require('./..');
var monitor = Monitor();
var report = Monitor.Report();

if (~module.parent) bus.use(monitor);

bus.actor(function (socket, cb) { cb(null, 'everyone'); });
bus.target(function (socket, params, cb) { cb(null, 'everyone'); });

bus.on(monitor.options.action, function (message) {
  report.combine(Monitor.Report(message.content()))
  message.deliver();
});

setInterval(function () {
  bus.message()
    .actor(monitor.options.actor)
    .action('update')
    .target('everyone')
    .content(report.data())
    .deliver();
}, monitor.options.interval);

module.exports = server;
