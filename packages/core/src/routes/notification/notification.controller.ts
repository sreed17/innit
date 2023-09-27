import { Router } from "express";
import * as NotificationService from "./notification.service";
import { StatusCodes } from "http-status-codes";
import passport from "passport";

const router = Router();

// jwt authentication
router.use(passport.authenticate("jwt", { session: false }));

/** ----- METHODS ----- */

/**
 * @swagger
 * /notification:
 *    post:
 *      summary: push a notification
 *      tags: [notification]
 *      requestBody:
 *          summary: All explicit fields from notification schema
 *          content:
 *            application/json:
 *              schema:
 *                $ref: "#/components/schemas/Notification"
 *      responses:
 *          "201":
 *              description: Created, notification pushed
 *
 */
router.post("/", async (req, res, next) => {
  try {
    await NotificationService.createNotification(req.body);
    res.sendStatus(StatusCodes.CREATED);
  } catch (err) {
    next(err);
  }
});

/** ----- EXPORTS ----- */
export default router;
