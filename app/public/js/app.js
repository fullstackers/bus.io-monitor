var timeline = {totals:{}, counts:[], deltas:[], max:120};
var graph = {counts:$('#counts').plot([], {legend:{container:$('#counts-legend')}}).data('plot'), deltas:$('#deltas').plot([], {legend:{container:$('#deltas-legend')}}).data('plot') };
var socket = io.connect();

socket.on('connect', function () {
  $('#connection').removeClass('disconnected').addClass('connected').html('connected').show();
});

socket.on('disconnect', function () {
  $('#connection').removeClass('connected').addClass('disconnected').html('disconnected').show();
});

socket.on('count', function (who, what) {
  if (timeline.counts.length >= timeline.max) timeline.counts.shift();
  timeline.counts.push(what);
  combine(timeline.totals, what);
  plot(graph.counts, timeline.counts);
  $('#totals').html(JSON.stringify(timeline.totals,null,2));
});

socket.on('delta', function (who, what) {
  if (timeline.deltas.length >= timeline.max) timeline.deltas.shift();
  timeline.deltas.push(what);
  plot(graph.deltas, timeline.deltas);
});

socket.on('timeline', function (totals, counts, deltas, max) {
  timeline.totals = totals || {};
  timeline.counts = counts || [report];
  timeline.deltas = deltas || [report];
  timeline.max =  max || timeline.max;
  plot(graph.counts, timeline.counts);
  plot(graph.deltas, timeline.deltas);
  $('#totals').html(JSON.stringify(timeline.totals,null,2));
});

function plot (graph, data) {
  graph.setData(prepare(data));
  graph.setupGrid();
  graph.draw();
}

function combine (a, b) {
  for (var k in b) a[k] = a[k] ? (a[k] + b[k]) : b[k];
}

function prepare (data) {
  var set = [], names = Object.getOwnPropertyNames(timeline.totals), i, j;
  for (i=0; i<names.length; i++) {
    set[i] = { label: names[i], data: [] };
    for (j=0; j<data.length; j++) {
      set[i].data[j] = [j, data[j][names[i]] ? data[j][names[i]] : 0];
    }
  }
  return set;
}
