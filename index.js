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
    // Assigning a unique ID to each message
    messageData.id = generateMessageId(); // Assuming you have a function generateMessageId to generate unique IDs
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

  // Handle 'new-reply' event
  socket.on("new-reply", (replyData) => {
    console.log(
      "New reply posted by:",
      replyData.username,
      "(ID: " + replyData.userId + ")"
    );
    console.log("Reply content:", replyData.replyContent);

    // Emitting new-reply event to all connected clients
    io.emit("new-reply", replyData);

    // Find the message by its ID
    const messageIndex = messages.findIndex(
      (message) => message.id === replyData.messageId
    );
    if (messageIndex !== -1) {
      // Add the reply to the message's replies array
      messages[messageIndex].replies.push({
        username: replyData.username,
        replyContent: replyData.replyContent,
      });
      // Broadcast the updated message to all connected clients
      io.emit("updated-message", messages[messageIndex]);
    }
  });

  // Handle 'disconnect' event
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Function to generate a unique message ID
function generateMessageId() {
  return Math.random().toString(36).substring(7);
}

// Function to handle replying to a message
function replyToMessage(messageId) {
  const replyContent = prompt("Enter your reply:");
  if (replyContent.trim() !== "") {
    // Emit a "new-reply" event to the server
    socket.emit("new-reply", { messageId, replyContent, userId, username });
  } else {
    alert("Please enter a reply.");
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
