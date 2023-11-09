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