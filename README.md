[![Build Status](https://travis-ci.org/turbonetix/bus.io-monitor.svg?branch=master)](https://travis-ci.org/turbonetix/bus.io-monitor)
[![NPM version](https://badge.fury.io/js/bus.io-monitor.svg)](http://badge.fury.io/js/bus.io-monitor)
[![David DM](https://david-dm.org/turbonetix/bus.io-monitor.png)](https://david-dm.org/turbonetix/bus.io-monitor.png)

![Bus.IO](https://raw.github.com/turbonetix/bus.io/master/logo.png)

# WIP (doesn't run yet!)

Monitor you bus.io apps with bus.io-monitor middleware.

```javascript

var bus = require('bus.io')(3000);
var monitor = require('bus.io-monitor');
bus.use(monitor());

```

The monitor will collect stats about your bus.io app.  Some kinds of events it will track
are when messages are going in the bus, beinging handled on the bus, and going to the socket.
The montior will also keep track of the number of connections to your bus.io app. 

Here we are creating an instance of our monitor and attaching a listener to the `report` event.

```javascript
var events = require('events');
var monitor = require('bus.io-monitor')();
monitor.on('report', function (data) {
 console.log(data);
});
bus.use(montior);
```

The `report` event is fired every interval and broadcast onto the bus.  Monitor has a built in
application that will aggregate report events.  It is a good idea to use the app on your bus.io
master process if using cluser.

```javascript
var cluster = reuqire('cluster');
if (Cluster.isMaster) {

    var montior = reuqire('bus.io-monitor');
    monitor.app().listen(3030);

    for (var i=0; i<require('os').cpus().length; i++) {
        cluster.fork();
    }
    
    return;
}
else {
    // do your other worker bus.io stuff here
}
````

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
