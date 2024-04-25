const socket = io();

socket.on("connect", () => {
  console.log("Connected to backend");
});

const username = prompt("Please enter your username:");
const userId = Math.random().toString(36).substring(7);

socket.emit("new-user", { username, userId });

socket.on("connect", () => {
  console.log("Connected to backend");
  alert(
    "Welcome to the Retro Tech Forum, " +
      username +
      "! Your user ID is: " +
      userId
  );
});

function postMessage() {
  const messageContent = document.getElementById("message-content").value;
  if (messageContent.trim() !== "") {
    socket.emit("new-message", { userId, username, messageContent });
  } else {
    alert("Please enter a message to post.");
  }
}

socket.on("new-image", (imageData) => {
  displayImage(imageData.imageDataURL);
});

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected.");
    return;
  }
  if (!file.type.match("image.*")) {
    console.error("Selected file is not an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const imageDataURL = reader.result;
    const img = new Image();
    img.src = imageDataURL;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      socket.emit("new-image", { imageDataURL: dataURL });
    };
  };

  reader.readAsDataURL(file);
}

// Add event listener for the upload button
document
  .getElementById("image-upload")
  .addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const imageDataURL = reader.result;
    const img = new Image();
    img.src = imageDataURL;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      socket.emit("new-image", { imageDataURL: dataURL });
    };
  };

  reader.readAsDataURL(file);
}

function displayImage(imageDataURL) {
  const postsSection = document.getElementById("posts");
  const imageDiv = document.createElement("div");
  imageDiv.classList.add("post");
  imageDiv.innerHTML = `
    <div class="post-header">
      <span class="username">Anonymous</span>
      <span class="timestamp">${new Date().toLocaleString()}</span>
    </div>
    <div class="post-content">
      <img src="${imageDataURL}" alt="Posted Image" />
    </div>
  `;
  postsSection.appendChild(imageDiv);
}

function displayMessage(messageData) {
  const postsSection = document.getElementById("posts");
  const postDiv = document.createElement("div");
  postDiv.classList.add("post");
  postDiv.innerHTML = `
    <div class="post-header">
      <span class="username">${messageData.username}</span>
      <span class="timestamp">${new Date().toLocaleString()}</span>
    </div>
    <div class="post-content">
      <div class="message-content">
        <p>${messageData.messageContent}</p>
      </div>
      <div class="replies-container" data-post-id="${messageData.id}">
        <!-- Replies will be displayed here -->
      </div>
    </div>
    <div class="post-footer">
      <button class="reply-btn" onclick="replyToMessage('${
        messageData.id
      }')">Reply</button>
    </div>
  `;
  postsSection.appendChild(postDiv);
}

socket.on("new-reply", (replyData) => {
  const postContainer = document.querySelector(
    `[data-post-id="${replyData.messageId}"]`
  );
  if (postContainer) {
    const repliesContainer =
      postContainer.getElementsByClassName("replies-container");
    if (repliesContainer) {
      const replyDiv = document.createElement("div");
      replyDiv.classList.add("reply");
      replyDiv.innerHTML = `
        <div class="reply-header">
          <span class="username">${replyData.username}</span>
        </div>
        <div class="reply-content">
          <p>${replyData.replyContent}</p>
        </div>
      `;
      console.log("repliesContainer:", repliesContainer);
      repliesContainer.appendChild(replyDiv);
    } else {
      console.error("Replies container not found in the post.");
    }
  } else {
    console.error("Post container not found.");
  }
});

socket.on("new-message", (messageData) => {
  displayMessage(messageData);
});

window.onload = function () {
  socket.emit("get-messages");
};

socket.on("all-messages", (allMessages) => {
  allMessages.forEach((messageData) => {
    displayMessage(messageData);
  });
});

function replyToMessage(messageId) {
  console.log("Message ID:", messageId);
  const replyContent = prompt("Enter your reply:");
  if (replyContent.trim() !== "") {
    // Emit a "new-reply" event to the server
    socket.emit("new-reply", { messageId, replyContent });
  } else {
    alert("Please enter a reply.");
  }
}
