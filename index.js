// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store messages in an array
let messages = [];

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle 'new-user' event
  socket.on("new-user", (userData) => {
    console.log(
      "New user joined:",
      userData.username,
      "(ID: " + userData.userId + ")"
    );
  });

  // Handle 'new-message' event
  socket.on("new-message", (messageData) => {
    console.log(
      "New message posted by:",
      messageData.username,
      "(ID: " + messageData.userId + ")"
    );
    console.log("Message content:", messageData.messageContent);
    // Add the message to the messages array
    messages.push(messageData);
    // Broadcast the message to all connected clients
    io.emit("new-message", messageData);
  });

  // Handle 'get-messages' event
  socket.on("get-messages", () => {
    // Send all messages to the client requesting them
    socket.emit("all-messages", messages);
  });

  // Handle 'disconnect' event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
