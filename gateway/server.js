const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const amqplib = require("amqplib");
require("dotenv/config");
const app = express();
const router = express.Router();
const { register, login, validate } = require("./services/auth");

let bucket;
const connection = mongoose.createConnection("mongodb://127.0.0.1:27017/videos");
connection.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(connection);
});
const videoStorage = new GridFsStorage({ db: connection });
const upload = multer({ storage: videoStorage }).single("video");

// parse json request body
app.use(express.json());

app.use(router);

router.post("/register", async (req, res) => {
  try {
    const response = await register(req.body);
    return res.status(201).send(response.data);
  } catch (error) {
    console.log("Register Error =>", error);
    if (error.response) {
      return res.status(500).send(error.response.data);
    } else {
      return res.status(500).send(error);
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const response = await login(req.body);
    return res.status(200).send(response.data);
  } catch (error) {
    console.log("Login Error =>", error);
    if (error.response) {
      return res.status(500).send(error.response.data);
    } else {
      return res.status(500).send(error);
    }
  }
});

router.post("/upload", upload, async (req, res) => {
  try {
    const response = await validate(req);
    if (response.data) {
      const videoFileId = req.file.id;
      const message = {
        videoFileId: videoFileId.toString(),
        audioFileId: null,
        userEmail: response.data.email,
      };
      console.log("message", message);

      const stringifyMessage = JSON.stringify(message);

      const queue = "videos";
      const conn = await amqplib.connect("amqp://localhost");
      const channel = await conn.createChannel();
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(stringifyMessage), { persistent: true });

      console.log(" [x] Sent '%s'", stringifyMessage);
      await channel.close();

      return res.status(201).send("Video uploaded successfully!");
    }
  } catch (error) {
    console.log("Upload Error =>", error);
    if (error.response) {
      return res.status(500).send(error.response.data);
    } else {
      return res.status(500).send(error);
    }
  }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Gateway service is running on port ${PORT}`));
