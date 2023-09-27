import { connect, connection, createConnection } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE = process.env.DATABASE;
if (!DATABASE) throw new Error("Database uri is undefined");
connect(DATABASE, { dbName: "innit" });

export function connectionFactory() {
  const conn = createConnection();
  conn.once("open", () =>
    console.info(`[${conn.id}]: Database connection established `)
  );
  conn.on("disconnected", () =>
    console.info(`[${conn.id}]: Database connection closed `)
  );
  conn.on("error", () =>
    console.error(`[${conn.id}]: database connection error occured`)
  );
}

const primaryConnection = () => {
  const conn = connection;
  conn.once("open", () =>
    console.info(`[${conn.id}]: Database connection established `)
  );
  conn.on("disconnected", () =>
    console.info(`[${conn.id}]: Database connection closed `)
  );
  conn.on("error", () =>
    console.error(`[${conn.id}]: database connection error occured`)
  );
  return conn;
};

export default primaryConnection();
