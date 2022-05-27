import React from "react";
import { SocketContext } from "../socket";
import { TMessage, TUser } from "../types";
import MessagePanel from "./MessagePanel";

import User from "./User";

const Chat = () => {
  const socket = React.useContext(SocketContext);

  const [users, setUsers] = React.useState<TUser[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<TUser | null>(null);

  const handleSendMessage = (content: string) => {
    if (selectedUser) {
      socket.emit("private message", {
        content,
        to: selectedUser.userID,
      });
      selectedUser.messages.push({
        content,
        fromSelf: true,
      });
    }
  };
  const handleSelectUser = (user: TUser) => {
    user.hasNewMessages = false;
    setSelectedUser(user);
  };

  React.useEffect(() => {
    socket.on("connect", () => {
      users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    socket.on("users", (_users) => {
      let temp: TUser[] = [];
      _users.forEach((user: TUser) => {
        user.messages.forEach((message: TMessage) => {
          message.fromSelf = message.from === socket.userID;
        });
        for (let i = 0; i < users.length; i++) {
          const existingUser = users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            existingUser.messages = user.messages;
            setUsers(users);
            return;
          }
        }
        user.self = user.userID === socket.userID;
        user.hasNewMessages = false;
        temp.push(user);
      });

      temp.sort((a: TUser, b: TUser) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      setUsers(temp);
    });

    socket.on("user connected", (user) => {
      let temp = [...users];
      const idx = temp.findIndex((o) => o.userID === user.userID);
      if (idx > -1) {
        temp[idx].connected = true;
        setUsers(temp);
        return;
      }
      user.hasNewMessages = false;
      temp.push(user);
      setUsers(temp);
    });

    socket.on("user disconnected", (id) => {
      let temp = [...users];
      const idx = temp.findIndex((o) => o.userID === id);
      if (idx > -1) {
        temp[idx].connected = false;
        setUsers(temp);
      }
    });

    socket.on("private message", ({ content, from, to }) => {
      let temp = [...users];
      for (let i = 0; i < temp.length; i++) {
        const user = temp[i];
        const fromSelf = socket.userID === from;
        if (user.userID === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf,
          });
          if (user !== selectedUser) {
            user.hasNewMessages = true;
          }
          setUsers(temp);
          break;
        }
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("users");
      socket.off("user connected");
      socket.off("user disconnected");
      socket.off("private message");
    };
  }, [socket, selectedUser, JSON.stringify(users)]);

  return (
    <div id="chat">
      <div className="left-panel">
        {users &&
          users.map((user) => {
            return (
              <div key={user.userID} onClick={() => handleSelectUser(user)}>
                <User {...user} />
              </div>
            );
          })}
      </div>

      <div className="right-panel">
        {selectedUser && (
          <MessagePanel
            selectedUser={selectedUser}
            handleSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
