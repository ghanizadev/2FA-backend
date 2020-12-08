import {Server} from "socket.io";
import User from "../../src/models/User";

declare global {
  namespace Express {
      export interface Request {
         websocket: Server,
         user: User,
      }
   }
}