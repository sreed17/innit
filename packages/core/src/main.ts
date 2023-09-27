import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "node:http";
import useRoutes from "./routes";
import useSocketServer from "./events";
import serverConfig from "./configs/server.config";
import { customErrorHandler } from "./utils/handlers";
import garbageCollector from "./garbageCollector";
import { log } from "./models/transactions";
import passport from "passport";
import { passportJwtConfig } from "./models/auth/jwt";

const app = express();
const PORT = serverConfig.port;

passportJwtConfig(passport);
/** ----- GLOBAL MIDDLEWARES ----- */
app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Adding Routers
useRoutes(app);

// Error Handlers
app.use(customErrorHandler);

/** ----- SERVER CONFIG & RUN----- */

const server = createHttpServer(app);

// Adding socket server
useSocketServer(server);

let gc_run: NodeJS.Timer;
server.listen(PORT, () => {
  console.log("[x] Innit API common-interface running at port %d", PORT);
  if (!gc_run) gc_run = setInterval(garbageCollector, 5 * 60 * 1000);
});
server.on("error", async (error) => {
  try {
    await log(500, "Server Error occured", error.toString());
  } catch (err) {
    console.log("Error: Couldn't log the server error");
  }
});

server.on("close", cleanUp);

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Process exited");
    process.exit(0);
  });
});

function cleanUp() {
  console.log("Closing Server: Clearing sessions and timers");
  if (gc_run) clearInterval(gc_run);
  console.log("Server closed:");
}
