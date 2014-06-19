var totals = {};
var points = [];
var max = 120;
var options = {};//{ series: { lines: { show: true }, points: { show: true } } };
var graph = $('#current').plot(prepare(), options).data('plot');
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

socket.on('timeline', function (report, diffs, total) {
  totals = report || {};
  points = diffs || [report];
  max = total || max;
  plot();
});

function plot () {
  $('#totals').html(JSON.stringify(totals,null,2));
  graph.setData(prepare());
  graph.setupGrid();
  graph.draw();
}

function combine (a, b) {
  for (var k in b) a[k] = a[k] ? (a[k] + b[k]) : b[k];
}

function prepare () {
  var set = [], names = Object.getOwnPropertyNames(totals), i, j;
  for (i=0; i<names.length; i++) {
    set[i] = { label: names[i], data: [] };
    for (j=0; j<points.length; j++) {
      set[i].data[j] = [j, points[j][names[i]] ? points[j][names[i]] : 0];
    }
  }
  return set;
}
