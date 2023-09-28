//@ts-check

import dotenv from "dotenv";

dotenv.config();

/**
 * @param {string} key
 * @returns string | null
 */
export function getEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}
