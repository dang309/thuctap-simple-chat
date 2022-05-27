import React from "react";

type Props = {
  handleUsernameSelection: (username: string) => void;
};

const SelectUsername = (props: Props) => {
  const [username, setUsername] = React.useState<string>("");
  return (
    <div className="select-username">
      <input
        placeholder="Username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        onClick={() => props.handleUsernameSelection(username)}
        disabled={username.length < 2}
      >
        Send
      </button>
    </div>
  );
};

export default SelectUsername;
