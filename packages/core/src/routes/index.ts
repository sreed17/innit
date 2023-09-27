import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import serverConfig from "../configs/server.config";

import AuthRouter from "./authentication/authentication.controller";
import UserRouter from "./users/users.controller";
import CommunityRouter from "./communities/communities.controller";
import TopicRouter from "./topics/topics.controller";
import ContentsRouter from "./contents/contents.controller";
//import InterestsRouter from "./interests/interests.controller";
import NotificationRouter from "./notification/notification.controller";
import MembersRouter from "./members/members.controller";
import { resolve as resolvePath } from "node:path";

const basePath = serverConfig.apiBasePath;

const swagger_opt: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "@innit/api",
      version: serverConfig.apiVersion,
      description:
        "Main interface for the Innit app, (HTTP REST API, Websocket)",
    },
    basePath,
    servers: [
      {
        url: `http://localhost:${serverConfig.port}${basePath}`,
        description: "Dev server",
      },
    ],
  },
  apis: [
    resolvePath(__dirname, "../models/*.{js,ts}"),
    "./**/*.controller.{js,ts}",
  ],
};
const specs = swaggerJsdoc(swagger_opt);

export default (app: Express) => {
  app.use(`/docs`, swaggerUi.serve, swaggerUi.setup(specs));
  app.use(`${basePath}/authentication`, AuthRouter);
  app.use(`${basePath}/users`, UserRouter);
  app.use(`${basePath}/communities`, CommunityRouter);
  app.use(`${basePath}/topics`, TopicRouter);
  app.use(`${basePath}/contents`, ContentsRouter);
  //app.use(`${basePath}/interests`, InterestsRouter);
  app.use(`${basePath}/members`, MembersRouter);
  app.use(`${basePath}/notification`, NotificationRouter);
};
