import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as CommunityService from "./communities.service";
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
   * /communities:
   *    get:
   *        summary: Find communitys statisfying certain filters and sort parameters
   *        tags: [communities]
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
      payload: await CommunityService.findManyCommunities(req.query),
    }))
  )
  /**
   * @swagger
   * /communities:
   *    post:
   *        summary: Create a community
   *        tags: [communities]
   *        requestBody:
   *            required: true
   *            summary: data for creating community (only the necessary fields)
   *            content:
   *                application/json:
   *                    schema:
   *                        $ref: "#/components/schemas/Community"
   *
   */
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await CommunityService.createCommunity(req.body, (cmid, tid) => {
        res.status(StatusCodes.CREATED).json({ cmid, tid });
      });
    } catch (err) {
      next(err);
    }
  });

router
  .route("/:cmid")
  /**
   * @swagger
   * /communities/{:cmid}:
   *    get:
   *      summary: Find community by id
   *      tags: [communities]
   *      parameters:
   *                 - in: path
   *                   name: cmid
   *                   schema:
   *                          type: string
   *                          description: CommunityID of the community
   *                 - in: query
   *                   name: select
   *                   schema:
   *                      type: string
   *                      description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await CommunityService.findCommunityById(
        req.params.cmid,
        req.query
      ),
    }))
  )

  /**
   * @swagger
   * /communities/{:cmid}:
   *    put:
   *      summary: Update community profile data
   *      tags: [communities]
   *      parameters:
   *                 - in: path
   *                   name: cmid
   *                   schema:
   *                          type: string
   *                          description: CommunityID of the community
   *      requestBody:
   *                  required: true
   *                  description: JSON object containing updates that need to be made, excluding _id, createdAt, modifiedAt, email, communityname properties
   *                  content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/Community"
   *
   */
  .put(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await CommunityService.updateCommunity(
        req.params.cmid,
        req.body
      ),
    }))
  );

/** ----- EXPORTS ----- */
export default router;
