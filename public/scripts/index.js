var socket = io();
$(document).ready(function () {
  
  socket.emit("get_history", {
  });
});
socket.on("checking", function () {
    console.log("check")
});
socket.on("done_updating", function () {
});