[![Build Status](https://travis-ci.org/turbonetix/bus.io-monitor.svg?branch=master)](https://travis-ci.org/turbonetix/bus.io-monitor)
[![NPM version](https://badge.fury.io/js/bus.io-monitor.svg)](http://badge.fury.io/js/bus.io-monitor)
[![David DM](https://david-dm.org/turbonetix/bus.io-monitor.png)](https://david-dm.org/turbonetix/bus.io-monitor.png)

![Bus.IO](https://raw.github.com/turbonetix/bus.io/master/logo.png)

Monitor you [bus.io](https://github.com/turbonetix/bus.io "bus.io") apps with `bus.io-monitor`.

```javascript
var bus = require('bus.io')(3000);
var monitor = require('bus.io-monitor');
bus.use(monitor());
```

A full list of options.

The monitor sends messages to the bus so you can configure how it delivers the messages.

```javascript
var bus = require('bus.io')(3000);
var monitor = require('bus.io-monitor');
bus.use(monitor({actor:'bus monitor', target:'bus monitor', action:'monitoring stuff', interval:1000}));
```

The `monitor` will collect stats about your `bus.io` app.  It keeps track of messages going
in the bus, on the bus, and going to the socket.  It will trigger a `report` event at an 
interval.  You can pass the `interval` as an option.

```javascript
var monitor = require('bus.io-monitor');
bus.use(monitor({interval:1000});
```

You can listen to the `report` event and consume it however you best see fit.

```javascript
var events = require('events');
var monitor = require('bus.io-monitor')();
monitor.on('report', function (report) {
 console.log(report.data());
});
bus.use(monitor);
```

The `monitor` has a built-in *cheesy* app that will aggregate `reports` and send them to its clients.

```javascript
var monitor = require('bus.io-monitor');
monitor.app().listen(3030);
```

You can also just run the app too.

```javascript
$ cd bus.io-monitor
$ npm install
$ PORT=3000 node app/
```

# API

## Monitor

### Monitor#()

```javascript
var monitor = require('bus.io-monitor')();
```

### Monitor#(options:Object)

Create a new `monitor` given these options.

```javascript
var monitor = require('bus.io-monitor')({actor:'me', target:'me', action:'report', interval:1000});
```

### Monitor#report()

Access the current `report` the `monitor` is populating.

```javascript
var report = monitor.report();
```

### Monitor#report(report:Report)

Setst he report to a new one.

```javascript
monitor.report(Report());
```

### Monitor#app()

Gets the built-in application that visual reports the data.

```javascript
monitor.app().listen(3030);
```

### Monitor#tick()

You can flush the current `report` and publish it by calling `tick()`;

```javascript
monitor.on('report', function (report) {
  console.log('report', report.data());
});
monitor.tick();
```

### Monitor#clearInterval()

This will stop the `tick()` method from being called each interval.

```javascript
monitor.clearInterval();
```

### Monitor#setInterval()

This method is called whenever you attach the `monitor` to a `bus`.  However, you
can always start it again if you happen to clear it.

```javascript
monitor.setInterval();
```

### Events

#### data

Triggered each time we collect data from a `message`.

```javacsript
monitor.on('data', function (data) {
  console.log('data');
});
```

#### report

Triggered each time the `tick()` method is invoked.

```javascript
monitor.on('report', function (report) {
  console.log(report.data());
});
```

## Report

A `monitor` populates a `report` with data it receives from the `data` event.

```javascript
var Report = require('bus.io-monitor').Report;
```

### Report#()

Makes a new `report`.

```javascript
var report = Report();
```

### Report#(report:Report)

Returns the passed in `report`.

```javascript
var a = Report();
var b = Report(a);
assert.equal(a, b);
```

### Report#(data:Object)

Creates a new report given the `data`.

```javascript
var data = { 'a':1, 'a.b':2, 'a.b.c': 3 };
var report = Report(data);
assert.equal(report.data(), data);
```

### Report#data()

Gets all the data for the report.

```javascript
report.data();
```

### Report#data(key:String)

Gets the value for the given `key`.

```javascript
report.data('some.key');
```

### Report#data(key:String,value:Number)

Sets the `value` for the given `key`.

```javascript
report.data('some.key', 1);
```

### Report#combine(report:Report)

Combines the values from the given `report` into the current `report`.

```javascript
var a = Report();
a.data('some.key', 1);

var b = Report();
b.data('some.key', 1);

a.combine(b);
assert.equal(a.data('some.key'), 2);
```

### Report#key(data:Array)

Converts the array of elements into a key that will be used in our report.

```javascript
var data = ['organism', 'insect', 'cricket'];
var key = report.key(data);
assert.equal(key, 'organism.insect.crieck');
```

### Report#populate(points:Array)

Populates a report by incrementing the values given the points. Or if they do not
already exist sets them to 1. This may sound confusing so look at the example below.

```javascript
var data = ['organism', 'insect', 'cricket'];
report.populate(data);
```

Now if you call `data()` you will get this output.

```javascript
{
  "animal": 1,
  "animal.insect":1,
  "animal.insect.cricket":1
}
```

# Installation and Environment Setup

Install node.js (See download and install instructions here: http://nodejs.org/).

Clone this repository

    > git clone git@github.com:turbonetix/bus.io-monitor.git

cd into the directory and install the dependencies

    > cd bus.io-monitor
    > npm install && npm shrinkwrap --dev

# Running Tests

Install coffee-script

    > npm install coffee-script -g

Tests are run using grunt.  You must first globally install the grunt-cli with npm.

    > sudo npm install -g grunt-cli

## Unit Tests

To run the tests, just run grunt

    > grunt spec

## TODO
