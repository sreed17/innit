import { mongo } from "mongoose";

export function toObjectId(str_id: string) {
  return mongo.BSON.ObjectId.createFromHexString(str_id);
}
