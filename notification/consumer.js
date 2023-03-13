const amqplib = require("amqplib");
const sendMail = require("./email");
require("dotenv/config");

(async () => {
  const queue = "audios";

  const conn = await amqplib.connect(process.env.RABBITMQ_HOST);
  const channel = await conn.createChannel();
  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (message) => {
    if (message !== null) {
      const payload = JSON.parse(message.content.toString());
      try {
        await sendMail(payload);
        channel.ack(message);
      } catch (error) {
        console.log("Error Sending Mail", error);
        channel.nack(message);
      }
    } else {
      console.log("Failed to consume message");
    }
  });
})();
