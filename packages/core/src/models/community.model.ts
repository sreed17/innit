import { Schema, Types, InferSchemaType, model } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Community:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, name, interests, owner]
 *                 description:  Metadata of the Communities
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            name:
 *                                type: string
 *                                description: Unique name of the community
 *                            owner:
 *                                type: string
 *                                description: ID of the user who created the community
 *                            interests:
 *                                type: array
 *                                items:
 *                                      type: string
 *                                      description: interests associated with the community (computed based on tags in child topics)
 *                            n_topics:
 *                                type: number
 *                                description: Number of active topics
 *                            private:
 *                                type: boolean
 *                                description: Whether the community is private or public
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const CommunitySchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    owner: { type: Types.ObjectId, required: true },
    interests: { type: [Types.ObjectId], required: true },
    n_topics: { type: Number, default: 0 },
    private: { type: Boolean },
  },
  { timestamps: true }
);

export type T_Community = InferSchemaType<typeof CommunitySchema>;

export const CommunityModel = model("Community", CommunitySchema);
export default CommunityModel;
