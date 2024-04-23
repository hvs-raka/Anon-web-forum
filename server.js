const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("new-user", (userData) => {
    console.log(
      "New user joined:",
      userData.username,
      "(ID: " + userData.userId + ")"
    );
  });

  socket.on("new-message", (messageData) => {
    console.log(
      "New message posted by:",
      messageData.username,
      "(ID: " + messageData.userId + ")"
    );
    console.log("Message content:", messageData.messageContent);

    messageData.id = generateMessageId();
    messageData.replies = []; // Initialize replies array for the message
    messages.push(messageData);

    io.emit("new-message", messageData);
  });

  socket.on("get-messages", () => {
    socket.emit("all-messages", messages);
  });

  socket.on("new-reply", (replyData) => {
    console.log(
      "New reply posted by:",
      replyData.username,
      "(ID: " + replyData.userId + ")"
    );
    console.log("Reply content:", replyData.replyContent);

    io.emit("new-reply", replyData);

    const messageIndex = messages.findIndex(
      (message) => message.id === replyData.messageId
    );
    if (messageIndex !== -1) {
      messages[messageIndex].replies.push({
        username: replyData.username,
        replyContent: replyData.replyContent,
      });
      io.emit("updated-message", messages[messageIndex]);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

function generateMessageId() {
  return Math.random().toString(36).substring(7);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
