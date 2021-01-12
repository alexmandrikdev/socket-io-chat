const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const onlineUsers = [];

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  onlineUsers.push({
    id: socket.id,
    nickname: socket.handshake.query.nickname,
  });

  io.to(socket.id).emit("connection established", onlineUsers);

  socket.broadcast.emit("user connected", {
    id: socket.id,
    nickname: socket.handshake.query.nickname,
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", {
      nickname: socket.handshake.query.nickname,
      msg,
    });
  });

  socket.on("disconnect", () => {
    const index = onlineUsers.findIndex((el) => el.id == socket.id);

    onlineUsers.splice(index, 1);

    socket.broadcast.emit("user disconnected", {
      id: socket.id,
      nickname: socket.handshake.query.nickname,
    });
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Listening on *:3000");
});
