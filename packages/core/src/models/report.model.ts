import { Schema, InferSchemaType, model, Types } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Report:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt, subject, subjectType, subjectOwner, by, reason, priority]
 *                 description:  Reports for user authentication (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            subject:
 *                                type: string
 *                                description: ID of the object liked
 *                            subjectType:
 *                                type: string
 *                                description: Type of the subject
 *                                enum: [user,  content]
 *                            subjectOwner:
 *                                type: string
 *                                description: ID of the subject owner
 *                            reason:
 *                                type: string
 *                                description: Reason for issuing the report
 *                            priority:
 *                                type: string
 *                                enum: [normal, high, critical]
 *                                default: normal
 *                                description: How critical is the reported issue
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const ReportSchema = new Schema(
  {
    subject: { type: Types.ObjectId, required: true },
    subjectType: {
      type: String,
      enum: ["user", "content"],
      required: true,
    },
    subjectOwner: { type: Types.ObjectId, required: true },
    reason: { type: String, required: true },
    priority: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "normal",
      required: true,
    },
  },
  { timestamps: true }
);

export type T_Report = InferSchemaType<typeof ReportSchema>;

export const ReportModel = model("Report", ReportSchema);
export default ReportModel;
