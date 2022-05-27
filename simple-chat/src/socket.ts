import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const BASE_URL = "http://localhost:5000";

export interface ISocket extends Socket {
  sessionID?: string | undefined;
  userID?: string | undefined;
  username?: string | undefined;
}

export const socket = io(BASE_URL, { autoConnect: false });
export const SocketContext = createContext<ISocket>(socket);
