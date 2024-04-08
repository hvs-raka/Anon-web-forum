const express = require("express");
const http = require("http");
const path = require("path");

const app = express();
const server = http.createServer();

let port = 9000;
server.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
