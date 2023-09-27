import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../utils/handlers";
import serverConfig from "../../configs/server.config";
import path from "node:path";
import { unlink } from "fs/promises";

export const resolveFilename = (filename: string) =>
  path.resolve(serverConfig.storageRoot, `image/${filename}`);

export async function deleteImageFile(filename: any) {
  if (typeof filename === "string") {
    await unlink(resolveFilename(filename));
  } else
    throw new CustomError(
      "filename(:string) query parameter is required",
      StatusCodes.BAD_REQUEST
    );
}
