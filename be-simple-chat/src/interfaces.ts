import { Socket } from "socket.io";

export interface ISocket extends Socket {
  sessionID?: string | undefined;
  userID?: string | undefined;
  username?: string | undefined;
}
