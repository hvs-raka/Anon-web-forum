const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer();
const io = new Server(server);

//socket io
io.on("connection", (socket) => {
  socket.on("connection", () => {
    console.log("Front-end is connected");
  });
});

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile("/public/index.html");
});

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
