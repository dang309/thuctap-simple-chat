import { createHash } from "crypto";

export const createSessionId = (username: string) => {
  return createHash("sha256").update(username).digest("hex");
};
