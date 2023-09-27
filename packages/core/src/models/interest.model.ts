import { Schema, InferSchemaType, model } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Interest:
 *                 type: object
 *                 required: [_id, name, tags, createdAt, updatedAt]
 *                 description: Major interest classes in the system
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            createdAt:
 *                                type: number
 *                                description: Timestamp of the created date-time
 *                            updatedAt:
 *                                type: number
 *                                description: Timestamp of the modified date-time
 *                            name:
 *                                type: string
 *                                description: Unique identifier for the interest group
 *                            tags:
 *                                type: array
 *                                items:
 *                                      type: string
 *                                      example: c++, java as tags for Programming Interest
 *                                description: Tags associated with the interest
 */

const InterestSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    tags: [String],
  },
  { timestamps: true }
);

export type T_Interest = InferSchemaType<typeof InterestSchema>;

export const InterestModel = model("Interest", InterestSchema);
export default InterestModel;
