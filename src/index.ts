import { UserChat } from "./services";

import { WebSocket } from "ws";

import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/../.env" });

const chat = new UserChat();
const wss = new WebSocket.Server({ path: "/api/socket", port: 3000 });
console.log(
  `Server starting.\nTime is ${new Date()}\n\turl: 'ws://${wss.options.host}:${wss.options.port}${
    wss.options.path
  }'`
);
wss.on("connection", (ws) => {
  console.log(`Client connected at ${new Date()}`);

  ws.on("message", async (message) => {
    const parsedMessage = JSON.parse(message.toString());
    // console.log("Received message: ", parsedMessage);

    await chat.processMessage(message.toString(), async (message: any) => {
      // console.log("Response message: ", message);
      wss.clients.forEach((client) => {
        client.send(Buffer.from(JSON.stringify(message)));
      });
      return true;
    });
  });
});
