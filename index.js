const express = require("express");
const sequalizedb = require("./sequalizedb");
const UserController = require("./Controller/UserController");
const fileUpload = require('express-fileupload');

const path = require('path');

const app = express();

app.use(express.json());

app.use(fileUpload());
app.get('/', (req, res) => {
  res.send("Hello");
});
app.post('/api/video/upload',UserController.Videoupload);
app.post('/api/videos/:id/trim',UserController.Videotrim);
app.post('/api/videos/:id/subtitles',UserController.Videosubtitles);
app.post('/api/videos/:id/render',UserController.Videorender);
app.get('/api/videos/:id/download',UserController.VideoGet);
app.listen(5000, () => {
  console.log("Server is running");
});
