import { Router } from "express";
import * as VideoService from "./video.service";
import path from "node:path";
import multer from "multer";
import { CustomError, rh } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";
import serverConfig from "../../configs/server.config";

const router = Router();

/** configuring multer for uploading */
const diskStorageOpts: multer.DiskStorageOptions = {
  destination: (req, file, cb) => {
    return cb(null, VideoService.storageDest);
  },
  filename: (req, file, cb) => {
    try {
      const { originalname, fieldname } = file;
      const ext = path.extname(originalname);
      const isVideo = file.mimetype.split("/")[0].toLowerCase() === "video";
      if (!isVideo) {
        throw new CustomError(
          "The file is not an video file",
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
   * /video:
   *      get:
   *        tags: [video]
   *        summary: stream the video specified by the filename parameter
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the video to be downloaded
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   *                    content:
   *                        video/*:
   *                            description: The requested video file
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

    VideoService.getVideoChunk(filename, range)
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
   * /video:
   *      post:
   *        tags: [video]
   *        summary: upload an videoFile video
   *        parameters:
   *            - in: query
   *              name: id
   *              description: ID of the object whose videoFile video is being uploaded
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
   *                            videoFile:
   *                              type: file
   *                              description: videoFile video file
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
    uploader.single("videoFile"),
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
   * /video:
   *      delete:
   *        tags: [video]
   *        summary: Delete an video with given filename
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the  video to be deleted
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   */

  .delete(async (req, res, next) => {
    try {
      await VideoService.deleteVideoFile(req.query.filename);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  });
/** ----- EXPORTS ----- */
export default router;
