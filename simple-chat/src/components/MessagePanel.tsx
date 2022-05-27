import React from "react";
import { SocketContext } from "../socket";

import { TMessage, TUser } from "../types";
import StatusIcon from "./StatusIcon";

type Props = {
  selectedUser: TUser;

  handleSendMessage: (content: string) => void;
};

const MessagePanel = (props: Props) => {
  const socket = React.useContext(SocketContext);

  const [content, setContent] = React.useState<string>("");
  const [isTyping, setIsTyping] = React.useState<boolean>(false);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    socket.emit("start-typing", props.selectedUser.userID);
  };

  const displaySender = (message: TMessage, index: number) => {
    return (
      index === 0 ||
      props.selectedUser.messages[index - 1].fromSelf !==
        props.selectedUser.messages[index].fromSelf
    );
  };

  React.useEffect(() => {
    if (content.length === 0) {
      socket.emit("stop-typing", props.selectedUser.userID);
    }

    socket.on("start-typing", () => {
      setIsTyping(true);
    });

    socket.on("stop-typing", () => {
      setIsTyping(false);
    });
  }, [socket, content]);

  return (
    <div className="message-panel">
      <div className="header">
        <StatusIcon
          color={props.selectedUser.connected ? "green" : "red"}
          width={16}
          height={16}
        />
        <p>{props.selectedUser.username}</p>
      </div>

      <div className="messages-container">
        <ul className="messages">
          {props.selectedUser.messages.map((message, index) => {
            return (
              <li className="message" key={index}>
                {displaySender(message, index) && (
                  <div className="sender">
                    {message.fromSelf
                      ? "(yourself)"
                      : props.selectedUser.username}
                  </div>
                )}
                <p>{message.content}</p>
              </li>
            );
          })}
        </ul>
        {isTyping && (
          <p className="typing">{props.selectedUser.username} is typing...</p>
        )}
      </div>

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          props.handleSendMessage(content);
          setContent("");
        }}
      >
        <input
          className="input"
          placeholder="Write a message..."
          value={content}
          onChange={handleTyping}
        />
        <button
          type="submit"
          className="send-button"
          disabled={content.length === 0}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePanel;
