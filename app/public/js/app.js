var totals = {};
var points = [];
var max = 360;

var socket = io.connect();

socket.on('connect', function () {
  $('#connection').removeClass('disconnected').addClass('connected').html('connected').show();
});

socket.on('disconnect', function () {
  $('#connection').removeClass('connected').addClass('disconnected').html('disconnected').show();
});

socket.on('update', function (who, what) {
  if (points.length >= max) points.shift();
  points.push(what);
  combine(totals, what);
  plot();
});

socket.on('timeline', function (report, diffs) {
  totals = report || {};
  points = diffs || [report];
  plot();
});

function plot () {
  $('#totals').html(JSON.stringify(totals,null,2));
  $('#current').html(JSON.stringify(points[points.length-1],null,2));
}

function combine (a, b) {
  for (var k in b) a[k] = a[k] ? (a[k] + b[k]) : b[k];
}
