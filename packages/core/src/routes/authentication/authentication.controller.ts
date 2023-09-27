import { NextFunction, Request, Response, Router } from "express";
import { createUser, verifyCredentials } from "../../models/transactions";
import { StatusCodes } from "http-status-codes";
import * as AuthenticationService from "./authentication.service";
import { CustomError, rh } from "../../utils/handlers";
import USessionModel, { T_USession } from "../../models/usession.model";
import { generateJwt } from "../../models/auth/jwt";
import passport from "passport";

const router = Router();
/** ----- START:METHODS ----- */

/**
 * @swagger
 * /authentication/signup:
 *                   post:
 *                        summary: Signup a new user
 *                        tags: [authentication]
 *                        requestBody:
 *                                    required: true
 *                                    description: Credentials of the user
 *                                    content:
 *                                            application/json:
 *                                                schema:
 *                                                       type: object
 *                                                       properties:
 *                                                                  email:
 *                                                                        type: string
 *                                                                        format: email
 *                                                                  username:
 *                                                                        type: string
 *                                                                  password:
 *                                                                        type: string
 *                                                                        format: password
 *                                                                        description: hashed password
 */
router
  .route("/signup")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createUser(req.body, (payload) => {
        res.status(StatusCodes.CREATED).json(payload);
      });
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * /authentication/login:
 *    post:
 *         summary: Get authenticated and login
 *         tags: [authentication]
 *         requestBody:
 *            required: true
 *            description: User credentials for login, password and either username, _id or email
 *            content:
 *                application/json:
 *                  schema:
 *                      oneOf:
 *                        - type: object
 *                          properties:
 *                              _id:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                                  format: password
 *                        - type: object
 *                          properties:
 *                              username:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                                  format: password
 *                        - type: object
 *                          properties:
 *                              email:
 *                                  type: string
 *                                  format: email
 *                              password:
 *                                  type: string
 *                                  format: password
 *         responses:
 *            "200":
 *                summary: OK, successfully logged in
 *                content:
 *                    application/json:
 *                        schema:
 *                            type: object
 *                            properties:
 *                                token:
 *                                    type: string
 *                                    description: jwt token
 *                                sid:
 *                                    type: string
 *                                    description: session id
 */
router
  .route("/login")
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { valid, uid } = await verifyCredentials(req.body);
      if (valid && typeof uid !== "undefined") {
        const sDoc = await USessionModel.create({ uid });
        res.status(StatusCodes.OK).json({
          ...generateJwt(String(sDoc._id), String(uid)),
          sid: sDoc._id,
        });
      } else {
        throw new CustomError(
          "check your credentials",
          StatusCodes.UNAUTHORIZED
        );
      }
    } catch (err) {
      next(err);
    }
  });

/**
 * @swagger
 * "/authentication/logout":
 *      delete:
 *          summary: Logout, delete the active session
 *          tags: [authentication]
 *          responses:
 *              "200":
 *                  description: OK, successfully logged out
 */
router.delete(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      if (!req.user)
        throw new CustomError(
          "No decoded jwt found",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      const { uid } = req.user as T_USession;
      await USessionModel.deleteOne({ uid });
      res.sendStatus(StatusCodes.OK);
    } catch (err: any) {
      next(err);
    }
  }
);

//** ----- USER SESSION ----- */

/**
 * @swagger
 * /authentication/session:
 *    get:
 *        summary: Find sessions statisfying certain filters and sort parameters
 *        tags: [authentication/session]
 *        parameters:
 *            - in: query
 *              name: filter
 *              schema:
 *                  type: string
 *                  description: URI encoded filter json object (as per mongodb find function parameter)
 *            - in: query
 *              name: pageNumber
 *              schema:
 *                  type: number
 *                  min: 0
 *            - in: query
 *              name: limit
 *              schema:
 *                  type: number
 *                  description: Limit for the number of docs to be fetched at a time  (as per mongodb limit function parameter)
 *                  default: 10
 *            - in: queryi
 *              name: sort
 *              schema:
 *                  type: string
 *                  description: URI encoded bson sort params (as per mongodb sort function parameter)
 *            - in: query
 *              name: select
 *              schema:
 *                  type: string
 *                  description: selected fields, as per the parameter of mongodb select function
 *        responses:
 *            "200":
 *                description: OK
 *                content:
 *                    application/json:
 *                      schema:
 *                        type: array
 *                        items:
 *                           $ref: "#/components/schemas/USession"
 */
router.get(
  "/session",
  passport.authenticate("jwt", { session: false }),
  rh(async (req) => ({
    statusCode: StatusCodes.OK,
    payload: await AuthenticationService.getSessions(req.query),
  }))
);

/**
 * @swagger
 * /authentication/session/{:uid}:
 *    get:
 *        summary: Find sessions associated with the user id<uid>
 *        tags: [authentication/session]
 *    parameters:
 *        - in: path
 *          required: true
 *          name: uid
 *          schema:
 *              type: string
 *              description: ID of the user whose session is being retreived
 *    responses:
 *        "200":
 *            description: OK
 *            content:
 *                application/json:
 *                  schema:
 *                    type: object
 *                    items:
 *                       $ref: "#/components/schemas/USession"
 */
router.get(
  "/session/:uid",
  passport.authenticate("jwt", { session: false }),
  rh(async (req) => ({
    statusCode: StatusCodes.OK,
    payload: await AuthenticationService.getSessionByUid(req.params.uid),
  }))
);

router
  .route("/session/:uid/status")
  /**
   * @swagger:
   * /authentication/session/{:uid}/status:
   *    get:
   *      summary: Get the status of the user session
   *      tags: [authentication/session]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the user having the session
   *            schema:
   *              type: string
   *      responses:
   *          "200":
   *              summary:  OK, successfully fetched
   *              content:
   *                application/json:
   *                    schema:
   *                        type: object
   *                        properties:
   *                            status:
   *                                type: string
   *          "400":
   *              summary: Not found, session is not active
   */
  .get(
    passport.authenticate("jwt", { session: false }),
    async (req, res, next) => {
      try {
        const doc = await AuthenticationService.getSessionByUid(req.params.uid);
        if (!doc) return res.sendStatus(StatusCodes.NOT_FOUND);
        res.status(StatusCodes.OK).json({ status: doc.status });
      } catch (err) {
        next(err);
      }
    }
  )
  /**
   * @swagger:
   * /authentication/session/{:uid}/status:
   *    put:
   *      summary: Change the status of the user session
   *      tags: [authentication/session]
   *      parameters:
   *          - in: path
   *            name: uid
   *            description: ID of the user having the session
   *            schema:
   *              type: string
   *          - in: query
   *            name: status
   *            description: Status string
   *            schema:
   *              type: string
   *      responses:
   *          "200":
   *              summary:  OK, successfully fetched
   */
  .put(
    passport.authenticate("jwt", { session: false }),
    async (req, res, next) => {
      try {
        // TODO: Fix Issue: status.OK is send irrespective of the uid being in an active session
        await AuthenticationService.updateSessionByUid(req.params.uid, {
          status: req.query.status,
        });
        res.sendStatus(StatusCodes.OK);
      } catch (err) {
        next(err);
      }
    }
  );

/** ----- END:METHODS----- */
export default router;
