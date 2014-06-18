var socket = io.connect();

socket.on('connect', function () {
  $('#connection').removeClass('disconnected').addClass('connected').html('connected').show();
});

socket.on('disconnect', function () {
  $('#connection').removeClass('connected').addClass('disconnected').html('disconnected').show();
});

socket.on('update', function (who, what) {
  $('#data').html(JSON.stringify(what,null,2));
});
