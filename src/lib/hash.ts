import crypto from "crypto";

export function hashPassword(password: string) {
  return crypto
    .pbkdf2Sync(password, process.env["HASHKEY"], 100000, 64, "sha512")
    .toString("hex");
}

export function checkPassword(password: string, hashPassword: string) {
  const hashToCheck = crypto
    .pbkdf2Sync(password, process.env["HASHKEY"], 100000, 64, "sha512")
    .toString("hex");

  return hashToCheck === hashPassword;
}

// Generate a random salt
