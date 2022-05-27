import { TSession } from "./types";

/* abstract */ class SessionStore {
  findSession(id: string) {}
  saveSession(id: string, session: TSession) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  sessions: Map<string, TSession>;
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id: string) {
    return this.sessions.get(id);
  }

  saveSession(id: string | undefined, session: TSession) {
    if (!id) return;
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

export default new InMemorySessionStore();
