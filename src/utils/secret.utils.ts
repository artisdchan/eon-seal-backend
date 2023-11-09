import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
} else {
  console.error(".env file not found.");
}

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const EONHUB_BACKEND_URL = process.env.EONHUB_BACKEND_URL as string;
export const EONHUB_API_KEY = process.env.EONHUB_API_KEY as string;
export const SEAL_DB_HOST = process.env.SEAL_DB_HOST as string;
export const SEAL_DB_PORT = process.env.SEAL_DB_PORT as string;
export const SEAL_DB_USER = process.env.SEAL_DB_USER as string;
export const SEAL_DB_PASS = process.env.SEAL_DB_PASS as string;