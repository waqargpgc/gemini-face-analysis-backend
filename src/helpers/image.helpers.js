import crypto from "crypto";

export function hashImage(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}
