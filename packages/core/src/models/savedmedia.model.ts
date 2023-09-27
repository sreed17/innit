import { Schema, InferSchemaType, model } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            SavedMedia:
 *                 type: object
 *                 required: [_id,  createdAt, updatedAt, mime, link]
 *                 description:  SavedMedias for user authentication (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            mime:
 *                                type: string
 *                                description: MIME type of the media file
 *                            link:
 *                                type: string
 *                                description: Url of the media file
 *                            thumbnail:
 *                                type: string
 *                                description: Url of the thumbnail image in case of video
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const SavedMediaSchema = new Schema(
  {
    mime: { type: String, required: true },
    link: { type: String, required: true },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

export type T_SavedMedia = InferSchemaType<typeof SavedMediaSchema>;

export const SavedMediaModel = model("SavedMedia", SavedMediaSchema);
export default SavedMediaModel;
