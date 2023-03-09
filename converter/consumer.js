const mongoose = require("mongoose");
const { GridFsStorage } = require("multer-gridfs-storage");
const amqplib = require("amqplib");
const fs = require("fs");
const { exec } = require("child_process");

let videoBucket, audioBucket;
// video mongo connection
const videoConnection = mongoose.createConnection("mongodb://localhost:27017/videos");
videoConnection.once("open", () => {
  videoBucket = new mongoose.mongo.GridFSBucket(videoConnection);
});

// audio mongo connection
const audioConnection = mongoose.createConnection("mongodb://localhost:27017/audios");
audioConnection.once("open", () => {
  audioBucket = new mongoose.mongo.GridFSBucket(audioConnection);
});
const audioStorage = new GridFsStorage({ db: videoConnection });

(async () => {
  const queue = "videos";

  const conn = await amqplib.connect("amqp://localhost");
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (message) => {
    if (message !== null) {
      const payload = JSON.parse(message.content.toString());
      console.log("Start ==>>", payload);

      const videofilePath = `video-${payload.videoFileId}.mp4`;
      const audiofilePath = `audio-${payload.videoFileId}.mp3`;

      // Download video file from mongo gridfs storage
      videoBucket
        .openDownloadStream(new mongoose.Types.ObjectId(payload.videoFileId))
        .pipe(fs.createWriteStream(videofilePath))
        .on("error", (error) => {
          if (error) {
            console.log("Error Downloading Video File", error);
          }
          channel.nack(message);
        })
        .on("finish", () => {
          // Convert video file to audio
          exec(`ffmpeg -i ${videofilePath} ${audiofilePath}`, async (error) => {
            if (error) {
              console.log(`Error Converting Video File: ${error}`);
              channel.nack(message);
            } else {
              console.log("Video converted to audio successfully");
              // Upload the audio to mongo gridfs storage
              fs.createReadStream(audiofilePath)
                .pipe(audioBucket.openUploadStream(payload.videoFileId, audioStorage))
                .on("error", (error) => {
                  if (error) {
                    console.log("Error Uploading Audio File", error);
                  }
                  channel.nack(message);
                })
                .on("finish", async (data) => {
                  fs.unlinkSync(videofilePath);
                  fs.unlinkSync(audiofilePath);

                  payload.audioFileId = data._id.toString();
                  const stringifyPayload = JSON.stringify(payload);

                  // Publish message to the audios queue
                  try {
                    await channel.assertQueue("audios", { durable: true });
                    channel.sendToQueue("audios", Buffer.from(stringifyPayload), { persistent: true });

                    channel.ack(message);
                    console.log("Finish ==>>", payload);
                  } catch (error) {
                    console.log("Failed to publish message", error);
                    audioBucket.delete(data._id);
                  }
                });
            }
          });
        });
    } else {
      console.log("Failed to consume message");
    }
  });
})();
