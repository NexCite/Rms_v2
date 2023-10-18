"use server";

import { getUserInfo } from "./auth";

export async function getConfigId() {
  const auth = await getUserInfo();
  return auth?.config_id;
}
