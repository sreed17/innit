import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            TopicContent:
 *                 type: object
 *                 required: [_id, createdOn, updatedAt, name, owner, parentId, tags, owner]
 *                 description: Represent the content related to a
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 *                            name:
 *                                type: string
 *                                description: Unique name of the topic
 *                            owner:
 *                                type: string
 *                                description: ID of the user who created the content
 *                            parentId:
 *                                type: string
 *                                description: ID of the parent channel
 *                            subjectId:
 *                                type: string
 *                                description: ID of other contents, acts like comments on other contents
 *                            tags:
 *                                type: array
 *                                items:
 *                                      type: string
 *                                      description: Tags associated with the topic, which will used to compute the interests
 *                            n_likes:
 *                                type: number
 *                                description: Number of likes received
 *                                default: 0
 *                            n_reports:
 *                                type: number
 *                                description: Number of reports received for this posts
 *                                default: 0
 *                            expiresOn:
 *                                type: number
 *                                description: Expiry date of the topic, value -1 indicates non-expiring
 *                                default: -1
 *                            mediaRef:
 *                                type: array
 *                                items:
 *                                    type: string
 *                                    description: ID of the medias attached to the content
 *                            textContent:
 *                                type: string
 *                                description: Text content (can be empty)
 *                            private:
 *                                type: boolean
 *                                description: Whether the topic is private or public, (topics of private communities are automatically private)
 *                                default: false
 */

const TopicContentSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    owner: { type: Types.ObjectId, required: true },
    parentId: { type: Types.ObjectId, required: true },
    subjectId: { type: Types.ObjectId, required: true },
    tags: { type: [String] },
    n_likes: { type: Number, default: 0 },
    n_reports: { type: Number, default: 0 },
    expiresOn: { type: Number, default: -1 },
    mediaRef: { type: [Types.ObjectId] },
    textContent: { type: String },
    private: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type T_TopicContent = InferSchemaType<typeof TopicContentSchema>;

export const TopicContentModel = model("TopicContent", TopicContentSchema);
export default TopicContentModel;
