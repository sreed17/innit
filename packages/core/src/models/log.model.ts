import { Schema, model, InferSchemaType } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Log:
 *                type: object
 *                description: System logs
 *                required: [_id, status, message]
 *                properties:
 *                           _id:
 *                               type: string
 *                               description: Auto-generated ID
 *                           status:
 *                               type: number
 *                               description: Status code of the log message
 *                           message:
 *                               type: string
 *                               description: Log message as a simple sentence
 *                           context:
 *                               type: string
 *                               description: serialized error or context object
 *
 */

const LogSchema = new Schema(
  {
    status: { type: Number, required: true },
    message: { type: String, required: true },
    context: { type: String },
  },
  { timestamps: true }
);

export type T_Log = InferSchemaType<typeof LogSchema>;

export const LogModel = model("log", LogSchema);
export default LogModel;
