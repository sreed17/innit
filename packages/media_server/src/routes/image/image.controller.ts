import { Router } from "express";
import * as ImageService from "./image.service";
import path from "node:path";
import multer from "multer";
import { CustomError, rh } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";
import serverConfig from "../../configs/server.config";

const router = Router();

/** configuring multer for uploading */
const diskStorageOpts: multer.DiskStorageOptions = {
  destination: (req, file, cb) => {
    return cb(null, path.resolve(serverConfig.storageRoot, "./image"));
  },
  filename: (req, file, cb) => {
    try {
      const { originalname, fieldname } = file;
      const ext = path.extname(originalname);
      const isImage = file.mimetype.split("/")[0].toLowerCase() === "image";
      if (!isImage) {
        throw new CustomError(
          "The file is not an image file",
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
   * /image:
   *      get:
   *        tags: [image]
   *        summary: Get/Download the image specified by the filename parameter
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the image to be downloaded
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   *                    content:
   *                        image/*:
   *                            description: The requested image file
   */

  .get(async (req, res, next) => {
    try {
      const { filename } = req.query;
      if (typeof filename !== "string" || filename.trim() == "") {
        throw new CustomError(
          "filename(:string) query parameter is required",
          StatusCodes.BAD_REQUEST
        );
      }
      res
        .status(StatusCodes.OK)
        .sendFile(ImageService.resolveFilename(filename));
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /image:
   *      delete:
   *        tags: [image]
   *        summary: Delete an image with given filename
   *        parameters:
   *            - in: query
   *              name: filename
   *              description: filename of the  image to be deleted
   *              schema:
   *                  type: string
   *        responses:
   *              "200":
   *                    description: OK, deleted
   */

  .delete(async (req, res, next) => {
    try {
      await ImageService.deleteImageFile(req.query.filename);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * /image/avatar:
 *      post:
 *        tags: [image]
 *        summary: upload an avatar image
 *        parameters:
 *            - in: query
 *              name: id
 *              description: ID of the object whose avatar image is being uploaded
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
 *                            avatar:
 *                              type: file
 *                              description: Avatar image file
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
router.post(
  "/avatar",
  uploader.single("avatar"),
  rh((req) => {
    if (!req.file) {
      throw new CustomError("File Uploading failed");
    }
    return {
      statusCode: StatusCodes.CREATED,
      payload: { filename: req.file.filename },
    };
  })
);

/**
 * @swagger
 * /image/banner:
 *      post:
 *        tags: [image]
 *        summary: upload a banner image
 *        parameters:
 *            - in: query
 *              name: id
 *              description: ID of the object whose banner image is being uploaded
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
 *                            banner:
 *                              type: file
 *                              description: image file
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
router.post(
  "/banner",
  uploader.single("banner"),
  rh((req) => {
    if (!req.file) {
      throw new CustomError("File Uploading failed");
    }
    return {
      statusCode: StatusCodes.CREATED,
      payload: { filename: req.file.filename },
    };
  })
);

/**
 * @swagger
 * /image/content:
 *      post:
 *        tags: [image]
 *        summary: upload a content image
 *        parameters:
 *            - in: query
 *              name: id
 *              description: ID of the object whose content image is being uploaded
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
 *                            imgContent:
 *                              type: file
 *                              description: image file
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
router.post(
  "/content",
  uploader.single("imgContent"),
  rh((req) => {
    if (!req.file) {
      throw new CustomError("File Uploading failed");
    }
    return {
      statusCode: StatusCodes.CREATED,
      payload: { filename: req.file.filename },
    };
  })
);
/** ----- EXPORTS ----- */
export default router;
