import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import serverConfig from "../configs/server.config";
import ImageRoute from "./image/image.controller";
import VideoRoute from "./video/video.controller";
import AudioRoute from "./audio/audio.controller";

const basePath = serverConfig.apiBasePath;

const swagger_opt: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "@innit/media-server",
      version: serverConfig.apiVersion,
      description: "API for the innit media server, (HTTP REST API)",
    },
    basePath,
    servers: [
      {
        url: `http://localhost:${serverConfig.port}${basePath}`,
        description: "Dev server",
      },
    ],
  },
  apis: ["./**/*.controller.{js,ts}"],
};
const specs = swaggerJsdoc(swagger_opt);

export default (app: Express) => {
  app.use(`/docs`, swaggerUi.serve, swaggerUi.setup(specs));
  app.use(`${basePath}/image`, ImageRoute);
  app.use(`${basePath}/video`, VideoRoute);
  app.use(`${basePath}/audio`, AudioRoute);
};
