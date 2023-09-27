import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as UserService from "./user.service";
import { CustomError, rh } from "../../utils/handlers";
import passport from "passport";

const router = Router();

// jwt authentication
router.use(passport.authenticate("jwt", { session: false }));
/** ----- METHODS ----- */

/**
 * @swagger
 * /users:
 *    get:
 *        summary: Find users statisfying certain filters and sort parameters
 *        tags: [users]
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
router.route("/").get(
  rh(async (req: Request) => ({
    statusCode: StatusCodes.OK,
    payload: await UserService.findManyUsers(req.query),
  }))
);

router
  .route("/:uid")
  /**
   * @swagger
   * /users/{:uid}:
   *    get:
   *      summary: Find user by id
   *      tags: [users]
   *      parameters:
   *                 - in: path
   *                   name: uid
   *                   schema:
   *                          type: string
   *                          description: UserID of the user
   *                 - in: query
   *                   name: select
   *                   schema:
   *                      type: string
   *                      description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await UserService.findUserById(req.params.uid, req.query),
    }))
  )

  /**
   * @swagger
   * /users/{:uid}:
   *    put:
   *      summary: Update user profile data
   *      tags: [users]
   *      parameters:
   *                 - in: path
   *                   name: uid
   *                   schema:
   *                          type: string
   *                          description: UserID of the user
   *      requestBody:
   *                  required: true
   *                  description: JSON object containing updates that need to be made, excluding _id, createdAt, modifiedAt, email, username properties
   *                  content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/User"
   *
   */
  .put(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await UserService.updateUser(req.params.uid, req.body),
    }))
  );

router
  .route("/:uid/friends")
  /**
   * @swagger
   * /users/{:uid}/friends:
   *    get:
   *      summary: get the friends of the user with ID<uid>
   *      tags: [users]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the current user
   *            schema:
   *              type: string
   *      requestBody:
   *          required: true
   *          summary: userid of the friend to be befriended
   *          content:
   *              application/json:
   *                  schema:
   *                      type: object
   *                      properties:
   *                          friendId:
   *                                    type: string
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await UserService.getFriends(req.params.uid, req.query),
    }))
  )
  /**
   * @swagger
   * /users/{:uid}/friends:
   *    post:
   *      summary: add a user with ID<friendId> to the friends list of the user with ID<uid>
   *      tags: [users]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the current user
   *            schema:
   *              type: string
   *      requestBody:
   *          required: true
   *          summary: userid of the friend to be befriended
   *          content:
   *              application/json:
   *                  schema:
   *                      type: object
   *                      properties:
   *                          friendId:
   *                                    type: string
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.params;
    const { friendId } = req.body;
    try {
      await UserService.addFriend(uid, friendId);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /users/{:uid}/friends:
   *    put:
   *      summary: confirm the friendship with the user with ID <friendId> specified in req body friendId from the friends list of user with ID<uid>
   *      tags: [users]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the current user
   *            schema:
   *              type: string
   *      requestBody:
   *          required: true
   *          summary: userid of the friend to be befriended
   *          content:
   *              application/json:
   *                  schema:
   *                      type: object
   *                      properties:
   *                          friendId:
   *                                    type: string
   
   */
  .put(async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.params;
    const { friendId } = req.body;
    try {
      await UserService.confirmFriendship(uid, friendId);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  })
  /**
   * @swagger
   * /users/{:uid}/friends:
   *    delete:
   *      summary: remove a user with id<friendId> from friends of the user with id<uid>
   *      tags: [users]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the current user
   *            schema:
   *              type: string
   *          - in: query
   *            name: friendId
   *            description: ID of the user who must be removed from friends
   *            schema:
   *               type: string
   */
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = req.params;
    const { friendId } = req.query;
    try {
      if (typeof friendId !== "string")
        throw new CustomError(
          "Require friendId in the request query",
          StatusCodes.BAD_REQUEST
        );
      await UserService.removeFriend(uid, friendId);
      res.sendStatus(StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  });

// stats:
/**
 * @swagger
 * /users/{:uid}/stats:
 *    get:
 *        summary: Get the stats of the user with ID<uid>
 *        tags: [users]
 *        parameters:
 *            - in: path
 *              name: uid
 *              schema:
 *                  type: string
 */
router.route("/:uid/stats").get(
  rh(async (req: Request) => ({
    statusCode: StatusCodes.OK,
    payload: await UserService.getUserStats(req.params.uid),
  }))
);

// actions
/**
 * @swagger
 * /users/{:uid}/action/report:
 *    post:
 *        summary: Get the stats of the user with ID<uid>
 *        tags: [users]
 *        parameters:
 *            - in: path
 *              name: uid
 *              schema:
 *                  type: string
 *        requestBody:
 *            content:
 *                application/json:
 *                    schema:
 *                        type: object
 *                        properties:
 *                            reason:
 *                              type: string
 *                              description: Reason for reporting the user
 *                            priority:
 *                              type: string
 *                              enum: [normal, high, critical]
 *                              default: normal
 *                              description: Priority of the report
 *
 */
router
  .route("/:uid/action/report")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserService.reportUser(req.params.uid, req.body);
      res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  });

// Liked contents
router
  .route("/:uid/content/liked")
  /**
   * @swagger
   * /users/{:uid}/content/liked:
   *    get:
   *      summary: get contents liked by the user
   *      tags: [users]
   *      parameters:
   *        - in: path
   *          name: uid
   *          description: ID of the current user
   *          schema:
   *            type: string
   *        - in: query
   *          name: size
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
   *
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await UserService.getLikedContents(req.params.uid, req.query),
    }))
  );

// Owned contents

/** ----- EXPORTS ----- */
export default router;
