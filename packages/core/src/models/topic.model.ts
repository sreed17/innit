import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Topic:
 *                 type: object
 *                 required: [_id, createdOn, updatedAt, name, parentId, tags, owner]
 *                 description: Metadata of topics
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            name:
 *                                type: string
 *                                description: Unique name of the topic
 *                            owner:
 *                                type: string
 *                                description: ID of the user who created the topic
 *                            parentId:
 *                                type: string
 *                                description: ID of the parent community
 *                            tags:
 *                                type: array
 *                                items:
 *                                      type: string
 *                                      description: Tags associated with the topic, which will used to compute the interests
 *                            n_members:
 *                                type: number
 *                                description: Number of members active in the topic
 *                                default: 0
 *                            n_contents:
 *                                type: number
 *                                description: Number of contents in the topic
 *                                default: 0
 *                            expiresOn:
 *                                type: number
 *                                description: Expiry date of the topic, value -1 indicates non-expiring
 *                                default: -1
 *                            type:
 *                                type: string
 *                                enum: [normal, realtime]
 *                                default: normal
 *                            private:
 *                                type: boolean
 *                                description: Whether the topic is private or public, (topics of private communities are automatically private)
 *                            photoUrl:
 *                                type: string
 *                                description: Url of the icon image for the topic
 *                            bannerUrl:
 *                                type: string
 *                                description: Url of the banner image for the topic
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const TopicSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    owner: { type: Types.ObjectId, required: true },
    parentId: { type: Types.ObjectId, required: true },
    tags: { type: [String], required: true },
    n_members: { type: Number, default: 0 },
    n_contents: { type: Number, default: 0 },
    expiresOn: { type: Number, default: -1 },
    type: { type: String, enum: ["normal", "realtime"], default: "normal" },
    private: { type: Boolean, default: false },
    photoUrl: { type: String },
    bannerUrl: { type: String },
  },
  { timestamps: true }
);

export type T_Topic = InferSchemaType<typeof TopicSchema>;

export const TopicModel = model("Topic", TopicSchema);
export default TopicModel;
