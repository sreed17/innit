import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            USession:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, uid, expiresAt]
 *                 description:  USessions for user authentication (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 *                            uid:
 *                                type: string
 *                                description: ID of the user who created the session
 *                            socketId:
 *                                type: string
 *                                description: Socket id
 *                            status:
 *                                type: string
 *                                description: Status of the user
 *                                default: online
 *                            expiresAt:
 *                                type: number
 *                                description: Session expiration time, -1 imples no expiration
 *                                default: -1
 */

const USessionSchema = new Schema(
  {
    uid: { type: Types.ObjectId, required: true, unique: true },
    socketId: { type: String, unique: true },
    status: {
      type: String,
      default: "online",
    },
    expiresAt: { type: Number, default: -1 },
  },
  { timestamps: true }
);

export type T_USession = InferSchemaType<typeof USessionSchema>;

export const USessionModel = model("USession", USessionSchema);
export default USessionModel;
