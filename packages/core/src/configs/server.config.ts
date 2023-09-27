import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 50000,
  apiVersion: "1.0.0",
  apiBasePath: "/v1",
};
