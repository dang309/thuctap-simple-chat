import React, { useState, useContext } from "react";

import { SocketContext } from "./socket";

import Chat from "./components/Chat";
import SelectUsername from "./components/SelectUsername";

import "./index.css";

function App() {
  const [usernameAlreadySelected, setUsernameAlreadySelected] =
    useState<boolean>(false);

  const socket = useContext(SocketContext);

  const handleUsernameSelection = (username: string) => {
    setUsernameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  };

  React.useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      setUsernameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on("session", ({ sessionID, userID }) => {
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;
    });

    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    });

    return () => {
      socket.off("connect_error");
    };
  }, [socket]);

  return (
    <div id="app">
      {usernameAlreadySelected ? (
        <Chat />
      ) : (
        <SelectUsername handleUsernameSelection={handleUsernameSelection} />
      )}
    </div>
  );
}

export default App;
