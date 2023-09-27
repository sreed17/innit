import { Router } from "express";
import * as AudioService from "./audio.service";
import path from "node:path";
import multer from "multer";
import { CustomError, rh } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";
import serverConfig from "../../configs/server.config";

const router = Router();

/** configuring multer for uploading */
const diskStorageOpts: multer.DiskStorageOptions = {
  destination: (req, file, cb) => {
    return cb(null, AudioService.storageDest);
  },
  filename: (req, file, cb) => {
    try {
      const { originalname, fieldname } = file;
      const ext = path.extname(originalname);
      const isAudio = file.mimetype.split("/")[0].toLowerCase() === "audio";
      if (!isAudio) {
        throw new CustomError(
          "The file is not an audio file",
          StatusCodes.BAD_REQUEST
        );
      }
      const { id } = req.query;
      if (typeof id !== "string" || typeof ext !== "string") {
        throw new CustomError(
          "No id or ext in request",
          StatusCodes.BAD_REQUEST
        );
      }
      // TODO: restrict the fieldname
      const filename = `${fieldname}_${id}${ext}`;
      cb(null, filename);
    } catch (err: any) {
      cb(new Error(err.message), "");
    }
  },
};

const uploader = multer({ storage: multer.diskStorage(diskStorageOpts) });
/** ----- METHODS ----- */
router
  .route("/")
  /**
   * @swagger
   * /audio:
   *      get:
   *        tags: [audio]
   *        summary: stream the audio specified by the filename parameter
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the audio to be downloaded
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   *                    content:
   *                        audio/*:
   *                            description: The requested audio file
   */

  .get(async (req, res, next) => {
    const { filename } = req.query;
    if (typeof filename !== "string" || filename.trim() == "")
      return next(
        new CustomError(
          `filename(:string) query parameter required`,
          StatusCodes.BAD_REQUEST
        )
      );
    const range = req.headers.range;
    if (!range)
      return next(
        new CustomError(
          `No range header in the request`,
          StatusCodes.BAD_REQUEST
        )
      );

    AudioService.getAudioChunk(filename, range)
      .then(({ start, end, totalSize, length, readStream, mime }) => {
        try {
          const headers = {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": length,
            "Content-Type": mime,
          };
          res.writeHead(206, headers);
          readStream.pipe(res);
        } catch (err) {
          next(err);
        }
      })
      .catch((err) => next(err));
  })
  /**
   * @swagger
   * /audio:
   *      post:
   *        tags: [audio]
   *        summary: upload an audioFile audio
   *        parameters:
   *            - in: query
   *              name: id
   *              description: ID of the object whose audioFile audio is being uploaded
   *              schema:
   *                  type: string
   *        requestBody:
   *             required: true
   *             summary: File to be uploaded
   *             content:
   *                multipart/form-data:
   *                    schema:
   *                        type: object
   *                        properties:
   *                            audioFile:
   *                              type: file
   *                              description: audioFile audio file
   *        responses:
   *              "201":
   *                    description: Uploaded
   *                    content:
   *                        application/json:
   *                              schema:
   *                                  type: object
   *                                  properties:
   *                                        filename:
   *                                            type: string
   *                                            description: new filename of the online content
   */
  .post(
    uploader.single("audioFile"),
    rh((req) => {
      if (!req.file) {
        throw new CustomError("File Uploading failed");
      }
      return {
        statusCode: StatusCodes.CREATED,
        payload: { filename: req.file.filename },
      };
    })
  )
  /**
   * @swagger
   * /audio:
   *      delete:
   *        tags: [audio]
   *        summary: Delete an audio with given filename
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the  audio to be deleted
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   */

  .delete(async (req, res, next) => {
    try {
      await AudioService.deleteAudioFile(req.query.filename);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  });
/** ----- EXPORTS ----- */
export default router;
