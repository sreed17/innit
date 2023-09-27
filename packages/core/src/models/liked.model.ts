import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Liked:
 *                 type: object
 *                 required: [_id, password, createdAt, updatedAt, subject, subjectOwner, by]
 *                 description:  Likeds for user authentication (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            subject:
 *                                type: string
 *                                description: ID of the object liked
 *                            subjectOwner:
 *                                type: string
 *                                description: ID of the subject owner
 *                            by:
 *                                type: string
 *                                description: ID of the user who liked the subject
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const LikedSchema = new Schema(
  {
    subject: { type: Types.ObjectId, required: true },
    subjectOwner: { type: Types.ObjectId, required: true },
    by: { type: Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export type T_Liked = InferSchemaType<typeof LikedSchema>;

export const LikedModel = model("Liked", LikedSchema);
export default LikedModel;
