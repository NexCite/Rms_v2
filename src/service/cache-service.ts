"use server";

import sqlite3 from "sqlite3";
import { open } from "sqlite";
export async function conntect() {
  const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database,
  });
  return {
    db,
  };
}

export async function initCache() {
  (await conntect()).db.exec(`CREATE TABLE IF NOT EXISTS  cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_id INTEGER,
        user_id INTEGER,
        key TEXT,
        json_value TEXT
    );`);
}
export async function getCache<T>({
  configId,
  key,
  userId,
}: {
  configId: number;
  userId: number;
  key: string;
}): Promise<T | undefined> {
  const { db } = await conntect();
  const result = await db.get(
    "SELECT json_value FROM cache WHERE config_id = ? AND user_id = ? AND key = ?",
    configId,
    userId,
    initCache
  );

  return result ? (JSON.parse(result.json_value) as T) : undefined;
}

export async function setCache(
  configId: number,
  userId: number,
  key: string,
  value: any
) {
  const { db } = await conntect();
  await db.run(
    "INSERT INTO cache (config_id, user_id, key, json_value) VALUES (?, ?, ?, ?)",
    configId,
    userId,
    key,
    JSON.stringify(value)
  );
}
