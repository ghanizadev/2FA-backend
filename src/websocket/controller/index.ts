import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import Client from "../../models/Client";

export default async (socket: Socket, next: (err?: ExtendedError) => void) => {
  console.log(`${socket.id} connected`);

  socket.on("ack", () => {
    const client = new Client({
      ip: socket.handshake.address,
      socketId: socket.id
    });
  
    client.save();
    socket.emit("code", client.toString());
  })

  socket.on("generate", () => {
    const client = new Client({
      ip: socket.handshake.address,
      socketId: socket.id
    });
  
    client.save();
    socket.emit("code", client.toString());
  })

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected: " + reason);
  });

  next();
};
