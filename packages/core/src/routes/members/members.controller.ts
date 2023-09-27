import { Router, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import * as MemberService from "./members.service";
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
   * /members:
   *    get:
   *        summary: Find members statisfying certain filters and sort parameters
   *        tags: [members]
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
      payload: await MemberService.findManyMembers(req.query),
    }))
  );

router
  .route("/:mid")
  /**
   * @swagger
   * /members/{:mid}:
   *    get:
   *      summary: Find member by id
   *      tags: [members]
   *      parameters:
   *                 - in: path
   *                   name: mid
   *                   schema:
   *                          type: string
   *                          description: MemberID of the member
   *                 - in: query
   *                   name: select
   *                   schema:
   *                      type: string
   *                      description: selected fields, as per the parameter of mongodb select function
   */
  .get(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await MemberService.findMemberById(req.params.mid, req.query),
    }))
  )

  /**
   * @swagger
   * /members/{:mid}:
   *    put:
   *      summary: Update member profile data
   *      tags: [members]
   *      parameters:
   *                 - in: path
   *                   name: mid
   *                   schema:
   *                          type: string
   *                          description: MemberID of the member
   *      requestBody:
   *                  required: true
   *                  description: JSON object containing updates that need to be made, excluding _id, createdAt, modifiedAt, email, membername properties
   *                  content:
   *                    application/json:
   *                        schema:
   *                            $ref: "#/components/schemas/Member"
   *
   */
  .put(
    rh(async (req: Request) => ({
      statusCode: StatusCodes.OK,
      payload: await MemberService.updateMember(req.params.mid, req.body),
    }))
  );

/** ----- EXPORTS----- */
export default router;
