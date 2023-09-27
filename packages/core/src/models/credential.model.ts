import { Schema, InferSchemaType, model } from "mongoose";

import bcrypt from "bcrypt";
/**
 * @swagger
 * components:
 *    schemas:
 *            Credential:
 *                 type: object
 *                 required: [_id, email, username, password, createdAt, updatedAt]
 *                 description:  Credentials for user authentication (Protected)
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated User ID
 *                            email:
 *                                type: string
 *                            username:
 *                                type: string
 *                            password:
 *                                type: string
 *                                description: Hashed password
 *                            createdAt:
 *                                type: number
 *                            updatedAt:
 *                                type: number
 */

const CredentialSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
export type T_Credential = InferSchemaType<typeof CredentialSchema>;

CredentialSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 10);
  this.password = hash;
  next();
});

CredentialSchema.methods.verifyPassword = async function (password: string) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

export const CredentialModel = model("Credential", CredentialSchema);
export default CredentialModel;
