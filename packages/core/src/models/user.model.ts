import { Schema, Types, InferSchemaType, model } from "mongoose";
import bcrypt from "bcrypt";
//
/**
 * @swagger
 * components:
 *    schemas:
 *            User:
 *                 type: object
 *                 required: [_id, email, username, createdAt, updatedAt]
 *                 description: Metadata of the user
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: ID of the user having this metadata
 *                            createdAt:
 *                                type: number
 *                                description: Timestamp of the created date-time
 *                            updatedAt:
 *                                type: number
 *                                description: Timestamp of the modified date-time
 *                            email:
 *                                type: string
 *                                description: Unique email ID linked with the account
 *                            username:
 *                                type: string
 *                                description: Unique username chosen by the user
 *                            dob:
 *                                type: number
 *                                description: Date of birth as timestamp
 *                            gender:
 *                                type: string
 *                                enum: [male, female, other]
 *                            about:
 *                                type: string
 *                                description: A short description about the user
 *                            photoUrl:
 *                                type: string
 *                                description: URL of the profile picture
 *                            bannerUrl:
 *                                type: string
 *                                description: URL of the banner image of the profile
 *                            interests:
 *                                type: array
 *                                items:
 *                                      type: string
 *                                      description: Reference to the interest object (ID)
 *                            location:
 *                                type: string
 *                                description: Current location of choice
 */

const UserSchema = new Schema(
  {
    _id: { type: Types.ObjectId },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    fullname: { type: String },
    dob: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    about: { type: String },
    photoUrl: { type: String },
    bannerUrl: { type: String },
    interests: [Types.ObjectId],
    location: { type: String },
  },
  { timestamps: true, _id: false }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt;
});

export type T_User = InferSchemaType<typeof UserSchema>;

export const UserModel = model("User", UserSchema);
export default UserModel;
