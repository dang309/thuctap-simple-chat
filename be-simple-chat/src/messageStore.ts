import { TMessage } from "./types";

/* abstract */ class MessageStore {
  saveMessage(message: TMessage) {}
  findMessagesForUser(userID: string) {}
}

class InMemoryMessageStore extends MessageStore {
  messages: TMessage[];
  constructor() {
    super();
    this.messages = [];
  }

  saveMessage(message: TMessage) {
    this.messages.push(message);
  }

  findMessagesForUser(userID: string | undefined) {
    if (!userID) return;
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID
    );
  }
}

export default new InMemoryMessageStore();
