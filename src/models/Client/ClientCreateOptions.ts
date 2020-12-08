import { Socket } from "socket.io";

export interface ClientCreateOptions {
    ip ?: string;
    socketId: string;
}