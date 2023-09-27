import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as ContentService from "./contents.service";
import { rh } from "../../utils/handlers";

import passport from "passport";

const router = Router();

// jwt authentication
router.use(passport.authenticate("jwt", { session: false }));

/** ----- METHODS ----- */

router
  .route("/")
  /**
   * @swagger
   * /contents:
   *    get:
   *        summary: Find contents statisfying certain filters and sort parameters
   *        tags: [contents]
   *    parameters:
   *        - in: query
   *          name: filter
   *          schema:
   *              type: string
   *              description: URI encoded filter json object (as per mongodb find function parameter)
   *        - in: query
   *          name: pageNumber
   *          schema:
   *              type: number
   *              min: 0
   *        - in: query
   *          name: limit
   *          schema:
   *              type: number
   *              description: Limit for the number of docs to be fetched at a time  (as per mongodb limit function parameter)
   *              default: 10
   *        - in: query
   *          name: sort
   *          schema:
   *              type: string
   *              description: URI encoded bson sort params (as per mongodb sort function parameter)
   *        - in: query
   *          name: select
   *          schema:
   *              type: string
   *              description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await ContentService.findManyContents(req.query),
    }))
  )
  /**
   * @swagger
   * /contents:
   *  post:
   *    summary: Create a new content
   *    tags: [contents]
   *    requestBody:
   *        required: true
   *        summary: All required fields for creating a new post
   *        content:
   *          application/json:
   *              schema:
   *                $ref: "#/components/schemas/TopicContent"
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.createContent(req.body, (cid) => {
        res.status(StatusCodes.CREATED).json({ cid });
      });
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:cid")
  /**
   * @swagger
   * /contents/{:cid}:
   *    get:
   *      summary: Find content by id
   *      tags: [contents]
   *      parameters:
   *                 - in: path
   *                   name: cid
   *                   schema:
   *                          type: string
   *                          description: ContentID of the content
   *                 - in: query
   *                   name: select
   *                   schema:
   *                      type: string
   *                      description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await ContentService.findContentById(req.params.cid, req.query),
    }))
  )

  /**
   * @swagger
   * /contents/{:cid}:
   *    put:
   *      summary: Update content meta data
   *      tags: [contents]
   *      parameters:
   *                 - in: path
   *                   name: cid
   *                   schema:
   *                          type: string
   *                          description: ContentID of the content
   *      requestBody:
   *                  required: true
   *                  description: JSON object containing updates that need to be made, excluding _id, createdAt, modifiedAt, email, contentname properties
   *                  content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/Content"
   *
   */
  .put(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await ContentService.updateContent(req.params.cid, req.body),
    }))
  )
  /**
   * @swagger
   * /contents/{:cid}:
   *    delete:
   *        summary: Delete the content
   *        tags: [contents]
   *        parameters:
   *            - in: path
   *              name: cid
   *              schema:
   *                  type: string
   *                  description: ID of the topic content
   *        responses:
   *            '200':
   *                description: OK, successfully deleted
   *
   */
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.deleteContent(req.params.cid);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * /contents/{:cid}/action/like:
 *    post:
 *        summary: Like the content
 *        tags: [contents]
 *        parameters:
 *            - in: path
 *              name: cid
 *              schema:
 *                type: string
 *                description: ID of the content to be liked
 *        requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                        subjectOwner:
 *                           type: string
 *                        by:
 *                           type: string
 */
router.post(
  "/:cid/action/like",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.likeContent(req.params.cid, req.body);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
);
/**
 * @swagger
 * /contents/{:cid}/action/unlike:
 *    post:
 *        summary: Unike the content
 *        tags: [contents]
 *        parameters:
 *            - in: path
 *              name: cid
 *              schema:
 *                type: string
 *                description: ID of the content to be liked
 *        requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                        subjectOwner:
 *                           type: string
 *                        by:
 *                           type: string
 */

router.post(
  "/:cid/action/unlike",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.unlikeContent(req.params.cid, req.body);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
);
/**
 * @swagger
 * /contents/{:cid}/action/report:
 *    post:
 *        summary: Report the content
 *        tags: [contents]
 *        parameters:
 *            - in: path
 *              name: cid
 *              schema:
 *                type: string
 *                description: ID of the content to be liked
 *        requestBody:
 *            required: true
 *            content:
 *              application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                        subjectOwner:
 *                           type: string
 *                        reason:
 *                           type: string
 *                        priority:
 *                           type: string
 *                           enum: [normal, high, critical]
 *                           default: normal
 */

router.post(
  "/:cid/action/report",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ContentService.reportContent(req.params.cid, req.body);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
);

/** ----- EXPORTS----- */
export default router;
