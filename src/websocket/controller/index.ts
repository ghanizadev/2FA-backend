import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import Client from "../../models/Client";

export default async (socket: Socket, next: (err?: ExtendedError) => void) => {
  console.log(`${socket.id} connected`);

  socket.on("ack", async () => {
    const client = new Client({
      ip: socket.handshake.address,
      socketId: socket.id
    });
  
    await client.save();
    const code = await client.generate();

    socket.emit("code", code);
  })

  socket.on("generate", async () => {
    const client = await Client.findById(socket.id);
    const code = await client.generate();

    socket.emit("code", code);
  })

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected: " + reason);
  });

  next();
};
