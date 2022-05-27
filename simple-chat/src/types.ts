export type TUser = {
  userID: string;
  username: string;
  connected: boolean;
  self: boolean;
  messages: TMessage[];
  hasNewMessages: boolean;
};

export type TMessage = {
  from?: string;
  to?: string;
  content: string;
  fromSelf: boolean;
};
