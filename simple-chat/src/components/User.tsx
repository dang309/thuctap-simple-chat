import React from "react";
import StatusIcon from "./StatusIcon";

type Props = {
  username: string;
  self: boolean;
  connected: boolean;

  hasNewMessages: boolean;
};

const User = (props: Props) => {
  return (
    <div className="user">
      <div className="description">
        <div className="name">
          <p>
            {props.username} {props.self ? "(MySelf)" : ""}
          </p>
        </div>
        <div className="status">
          <StatusIcon
            width={16}
            height={16}
            color={props.connected ? "green" : "red"}
          />
          <p>{props.connected ? "Online" : "Offline"}</p>
        </div>
      </div>
      {props.hasNewMessages && <div className="new-messages">!</div>}
    </div>
  );
};

export default User;
