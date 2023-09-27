import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Member:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, uid, communityId, topicId,  role]
 *                 description: Represents a membership relationship between a user and a channel/community
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 *                            uid:
 *                                type: string
 *                                description: ID of the user who is taking the membership
 *                            communityId:
 *                                type: string
 *                                description: ID of the community in this membership belongs to
 *                            topicId:
 *                                type: string
 *                                description: ID of the topic this membership belongs to
 *                            role:
 *                                type: string
 *                                default: normal
 *                                enum: [normal, admin, owner]
 *                            n_reports:
 *                                type: number
 *                                default: 0
 *                                descriptions: Number of reports received by the user throughout this membership
 *                            isBanned:
 *                                type: boolean
 *                                description: Whether the user is banned, hence the membership is revoked (till certain period)
 */

const MemberSchema = new Schema(
  {
    uid: { type: Types.ObjectId, required: true },
    communityId: { type: Types.ObjectId, required: true },
    topicId: { type: Types.ObjectId, required: true },
    role: {
      type: String,
      enum: ["normal", "owner", "admin"],
      default: "normal",
    },
    n_reports: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type T_Member = InferSchemaType<typeof MemberSchema>;

export const MemberModel = model("Member", MemberSchema);
export default MemberModel;
