import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Notification:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, message, recipients, priority]
 *                 description:  Represents Notification object  (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 *                            subject:
 *                                type: string
 *                                description: ID of the object liked
 *                            subjectType:
 *                                type: string
 *                                description: Type of the subject
 *                                enum: [user, community, topic, content]
 *                            message:
 *                                type: string
 *                                description: What this notification is about
 *                            recipients:
 *                                type: array
 *                                items:
 *                                    type: string
 *                                    format: objectid
 *                                    description: ID of the users who needs to be notified
 *                            priority:
 *                                type: number
 *                                description: priority of the notification
 */

const NotificationSchema = new Schema(
  {
    subject: { type: Types.ObjectId },
    subjectType: {
      type: String,
      enum: ["user", "community", "topic", "content"],
    },
    message: { type: String, required: true },
    recipients: { type: [Types.ObjectId], required: true },
    priority: { type: Number, required: true },
  },
  { timestamps: true }
);

export type T_Notification = InferSchemaType<typeof NotificationSchema>;

export const NotificationModel = model("Notification", NotificationSchema);
export default NotificationModel;
