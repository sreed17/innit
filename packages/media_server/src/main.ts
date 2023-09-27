import express from "express";
import { createServer as createHttpServer } from "http";
import cors from "cors";
import server_config from "./configs/server.config";
import useRoutes from "./routes";
import { customErrorHandler } from "./utils/handlers";

const app = express();
/** ----- MIDDLEWARES ----- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// add routes(endpoints)
useRoutes(app);

// error handlers
app.use(customErrorHandler);

/** ----- RUN SERVER ----- */

const server = createHttpServer(app);
const PORT = server_config.port;
server.listen(PORT, () => {
  console.log("[x] Innit API common-interface running at port %d", PORT);
});
