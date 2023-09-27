import dotenv from "dotenv";
import path, { resolve } from "node:path";
dotenv.config();

export default {
  port: process.env.PORT,
  apiBasePath: "/v1",
  apiVersion: "1.0.0",
  storageRoot: resolve(process.cwd(), "./storage"),
};
