import express, {
  Express,
  Request,
  Response,
  ErrorRequestHandler,
  NextFunction,
} from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import SessionStore from "./sessionStore";
import MessageStore from "./messageStore";
import { ISocket } from "./interfaces";

import { createSessionId } from "./utils";
import { TSession, TUser } from "./types";

const resTemplate = (data: any) => {
  return {
    status: 200,
    result: true,
    message: "",
    data,
  };
};

const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.use(async (socket: ISocket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = await SessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = createSessionId(username);
  socket.userID = createSessionId(username);
  socket.username = username;
  next();
});

io.on("connection", async (socket: ISocket) => {
  SessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  if (socket.userID) {
    socket.join(socket.userID);
  }

  const users: TUser[] = [];
  const [messages, sessions] = await Promise.all([
    MessageStore.findMessagesForUser(socket.userID),
    SessionStore.findAllSessions(),
  ]);
  const messagesPerUser = new Map();
  messages?.forEach((message) => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });

  sessions.forEach((session: TSession) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });
  socket.emit("users", users);

  // notify existing users
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
    messages: [],
  });

  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("private message", ({ content, to }) => {
    if (socket.userID) {
      const message = {
        content,
        from: socket.userID,
        to,
      };
      socket.to(to).to(socket.userID).emit("private message", message);
      MessageStore.saveMessage(message);
    }
  });

  socket.on("start-typing", (to) => {
    socket.to(to).emit("start-typing");
  });

  socket.on("stop-typing", (to) => {
    socket.to(to).emit("stop-typing");
  });

  socket.on("disconnect", async () => {
    if (socket.userID) {
      const matchingSockets = await io.in(socket.userID).allSockets();
      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        socket.broadcast.emit("user disconnected", socket.userID);
        SessionStore.saveSession(socket.sessionID, {
          userID: socket.userID,
          username: socket.username,
          connected: false,
        });
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
