import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Banned:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, subject, subjectType, subjectOwner, till]
 *                 description: Represents a Banneds action on an object (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            subject:
 *                                type: string
 *                                description: ID of the object liked
 *                            subjectType:
 *                                type: string
 *                                description: Type of the subject
 *                                enum: [user, community, topic, content]
 *                            subjectOwner:
 *                                type: string
 *                                description: ID of the subject owner
 *                            till:
 *                                type: number
 *                                description: Date-Time till the ban exists
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const BannedSchema = new Schema(
  {
    subject: { type: Types.ObjectId, required: true },
    subjectType: {
      type: String,
      enum: ["user", "community", "topic", "content"],
      required: true,
    },
    subjectOwner: { type: Types.ObjectId, required: true },
    till: { type: Number, required: true },
  },
  { timestamps: true }
);

export type T_Banned = InferSchemaType<typeof BannedSchema>;

export const BannedModel = model("Banned", BannedSchema);
export default BannedModel;
