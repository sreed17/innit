import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as TopicService from "./topics.service";
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
   * /topics:
   *    get:
   *        summary: Find topics statisfying certain filters and sort parameters
   *        tags: [topics]
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
      payload: await TopicService.findManyTopics(req.query),
    }))
  )
  /**
   * @swagger
   * /topics:
   *    post:
   *        summary: Create a new topic
   *        tags: [topics]
   *        requestBody:
   *            required: true
   *            summary: All necessary fields from the Topics schema
   *            content:
   *              application/json:
   *                  schema:
   *                    $ref: "#/components/schemas/Topic"
   *        responses:
   *            "201":
   *              description: CREATED
   *              content:
   *                  application/json:
   *                        schema:
   *                            type: object
   *                            properties:
   *                                tid:
   *                                    type: string
   *                                    description: ID of the topic just created
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TopicService.createTopic(req.body, (tid) => {
        res.status(StatusCodes.CREATED).json({ tid });
      });
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:tid")
  /**
   * @swagger
   * /topics/{:tid}:
   *    get:
   *      summary: Find topic by id
   *      tags: [topics]
   *      parameters:
   *                 - in: path
   *                   name: tid
   *                   schema:
   *                          type: string
   *                          description: TopicID of the topic
   *                 - in: query
   *                   name: select
   *                   schema:
   *                      type: string
   *                      description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await TopicService.findTopicById(req.params.tid, req.query),
    }))
  )

  /**
   * @swagger
   * /topics/{:tid}:
   *    put:
   *      summary: Update topic profile data
   *      tags: [topics]
   *      parameters:
   *                 - in: path
   *                   name: tid
   *                   schema:
   *                          type: string
   *                          description: TopicID of the topic
   *      requestBody:
   *                  required: true
   *                  description: JSON object containing updates that need to be made, excluding _id, createdAt, modifiedAt, email, topicname properties
   *                  content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/Topic"
   *
   */
  .put(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await TopicService.updateTopic(req.params.tid, req.body),
    }))
  );

/**
 * @swagger
 * /topics/{:tid}/action/join:
 *    post:
 *       summary: Join a topic
 *       tags: [topics]
 *       parameters:
 *           - in: path
 *             name: tid
 *             schema:
 *                  type: string
 *                  description: ID of the topic
 *       requestBody:
 *            required: true
 *            summary: Necessary fields from the Member schema
 *            content:
 *               application/json:
 *                  schema:
 *                    $ref: "#/components/schemas/Member"
 *       responses:
 *           "201":
 *              description: Created membership record
 */
router.post(
  "/topics/:tid/action/join",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TopicService.joinTopic(req.params.tid, req.body);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /topics/{:tid}/action/leave:
 *    delete:
 *       summary: Leave a topic
 *       tags: [topics]
 *       parameters:
 *           - in: path
 *             name: tid
 *             schema:
 *                  type: string
 *                  description: ID of the topic
 *           - in: query
 *             name: uid
 *             schema:
 *                  type: string
 *                  description: ID of the user who is leaving
 *       responses:
 *           "200":
 *              description: Deleted membership record
 */
router.delete(
  "/topics/:tid/action/leave",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TopicService.leaveTopic(req.params.tid, req.query.uid);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
);

/** ----- EXPORTS----- */
export default router;
