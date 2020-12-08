import { Server } from "socket.io";
import http from "http";
import config from "./config";
import controller from "./controller";

const io = new Server();

io.use(controller);

export default (server: http.Server) => {
  io.attach(server, config);
  return io;
};
