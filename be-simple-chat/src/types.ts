export type TMessage = {
  from: string | undefined;
  to: string | undefined;
  content: string | undefined;
};

export type TSession = {
  userID: string | undefined;
  username: string | undefined;
  connected: boolean | undefined;
  messages?: TMessage[];
};

export type TUser = {
  userID: string | undefined;
  username: string | undefined;
  connected: boolean | undefined;
  messages: TMessage[];
};
