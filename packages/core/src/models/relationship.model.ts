import { Schema, Types, InferSchemaType, model } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Relationship:
 *                 type: object
 *                 required: [_id, from, to, type, bidirectional, needConfirmation, createdAt, updatedAt]
 *                 description: A graph based relationship model, relates two users by a relationship type
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated ID
 *                            to:
 *                                type: string
 *                                description: ID of the user to whom the relationship is made
 *                            from:
 *                                type: string
 *                                description: ID of the user who initiates the relationship
 *                            type:
 *                                type: string
 *                                enum : [friend]
 *                                default: friend
 *                                description: Type of relation
 *                            bidirectional:
 *                                type: boolean
 *                                description: Whether the relationship (edge) is bidirectional or not
 *                                default: false
 *                            needConfirmation:
 *                                type: boolean
 *                                description: Whether the relationship need confirmation from both sides or not
 *                                default: false
 *                            isConfirmed:
 *                                type: boolean
 *                                description: Whether the relationship is confirmed agreeded by both users
 *                                default: false
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const RelationshipSchema = new Schema(
  {
    from: { type: Types.ObjectId, required: true },
    to: { type: Types.ObjectId, required: true },
    type: { type: String, enum: ["friend"], default: "friend" },
    bidirectional: { type: Boolean, default: false },
    needConfirmation: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type T_Relationship = InferSchemaType<typeof RelationshipSchema>;

export const RelationshipModel = model("Relationship", RelationshipSchema);
export default RelationshipModel;
