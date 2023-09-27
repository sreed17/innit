import { StatusCodes } from "http-status-codes";
import { CustomError } from "../../utils/handlers";
import serverConfig from "../../configs/server.config";
import path from "node:path";
import { unlink } from "fs/promises";
import { createReadStream, statSync } from "node:fs";
import Mime from "mime-types";

export const storageDest = path.resolve(serverConfig.storageRoot, "audio");

export const resolveFilename = (filename: string) =>
  path.resolve(storageDest, filename);

export async function deleteAudioFile(filename: any) {
  if (typeof filename === "string") {
    await unlink(resolveFilename(filename));
  } else
    throw new CustomError(
      "filename(:string) query parameter is required",
      StatusCodes.BAD_REQUEST
    );
}

export async function getAudioChunk(
  filename: string,
  range: string,
  opts: { size?: number } = {}
) {
  const defaultOpts = { size: 10 ** 6 }; // default chink size 1MB
  const { size } = { ...defaultOpts, ...opts };

  const _filename = resolveFilename(filename);
  const { size: total_size } = statSync(_filename);

  const mime = Mime.lookup(_filename);
  if (!mime) throw new CustomError("file type is undefined", 500);

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + size, total_size - 1);

  const readStream = createReadStream(_filename, { start, end });

  return {
    start,
    end,
    totalSize: total_size,
    length: end - start + 1,
    mime,
    readStream,
  };
}
