import { compareSync, hashSync } from "bcrypt";

export function hashPassword(password: string) {
  return hashSync(password, 12);
}

export function checkPassword(password: string, hashPassword: string) {
  return compareSync(password, hashPassword);
}
