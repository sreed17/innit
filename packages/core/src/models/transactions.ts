import { T_Credential, CredentialModel } from "./credential.model";
import { T_Stats, StatsModel } from "./stats.model";
import { T_User, UserModel } from "./user.model";
import { LogModel } from "./log.model";
import dbConnection from "../models/connection";
import { CustomError } from "../utils/handlers";
import { StatusCodes } from "http-status-codes";
import type { Model } from "mongoose";

/**
 * TODO: Create a new user, create all the related docs in respective collections
 */
export async function createUser(
  credentials: T_Credential,
  cb: (payload: { _id: string; email: string; username: string }) => void
) {
  const { email, username, password } = credentials;
  if (!email || !username || !password)
    throw new CustomError(
      "missing credentials one_of(email, username, password)",
      StatusCodes.BAD_REQUEST
    );
  const session = await dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const cred = new CredentialModel(credentials);
      const stats = new StatsModel({ _id: cred._id });
      const user_meta = new UserModel({ _id: cred._id, email, username });
      await cred.save();
      await stats.save();
      await user_meta.save();
      if (typeof cb === "function")
        cb({ _id: cred._id.toString(), email, username });
    });
  } finally {
    session.endSession();
  }
}

/**
 *  TODO: delete user and all related docs from their respective collections
 */
export async function deleteUser(uid: string, cb: (success: boolean) => void) {
  const session = await dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      // TODO: code goes here...
    });
  } finally {
    session.endSession();
  }
}

/**
 * Verify credentials
 */

type T_VCIdentifier =
  | { _id: string }
  | { username: string }
  | { email: string };
type T_VCParams = { password: string } & T_VCIdentifier;

export async function verifyCredentials(credentials: T_VCParams) {
  const filter: {
    _id?: string;
    username?: string;
    email?: string;
  } = {};
  if ("_id" in credentials) {
    filter._id = credentials._id;
  } else if ("username" in credentials) {
    filter.username = credentials.username;
  } else if ("email" in credentials) {
    filter.email = credentials.email;
  } else {
    throw new CustomError(
      "Neither id, username or email present as the user identifier in the request body",
      StatusCodes.BAD_REQUEST
    );
  }

  const doc_creds = await CredentialModel.findOne(filter);
  if (!doc_creds) return { valid: false, uid: undefined };
  //
  const compare = await (doc_creds as any).verifyPassword(credentials.password);
  return { valid: compare, uid: doc_creds._id };
}

type p_findmany = {
  filter: string;
  sort: string;
  pageNumber: number;
  limit?: number;
  select?: string;
};

export async function findManyFromModel<T>(model: Model<T>, input: any) {
  const { filter, sort, pageNumber, limit = 10, select }: p_findmany = input;
  if (
    typeof filter === "string" &&
    filter.trim() !== "" &&
    typeof sort === "string" &&
    sort.trim() !== "" &&
    typeof limit === "number"
  ) {
    const j_filters = JSON.parse(decodeURIComponent(filter));
    const j_sort = JSON.parse(decodeURIComponent(sort));
    const base_query = model
      .find(j_filters)
      .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
      .limit(limit)
      .sort(j_sort);
    if (select && typeof select === "string") {
      return base_query.select(select).exec();
    }
    return base_query.exec();
  } else
    throw new CustomError("Invalid query paramters", StatusCodes.BAD_REQUEST);
}

export async function findByIdFromModel<T>(
  model: Model<T>,
  id: string,
  select?: string
) {
  if (typeof id === "string" && id.trim() !== "") {
    if (typeof select === "string" && select.trim() !== "") {
      return model.findById(id).select(select).exec();
    }
    return model.findById(id).exec();
  } else
    throw new CustomError(
      "Invalid id, id must be a non-null string",
      StatusCodes.BAD_REQUEST
    );
}

export async function findOneFromModel<T>(
  model: Model<T>,
  filter: string,
  select?: string
) {
  if (typeof filter === "string" && filter.trim() !== "") {
    const j_filter = JSON.parse(decodeURIComponent(filter));
    const base_query = model.findOne(j_filter);
    if (typeof select === "string" && select.trim() !== "") {
      return base_query.select(select).exec();
    }
    return base_query.exec();
  } else
    throw new CustomError(
      "Invalid id, id must be a non-null string",
      StatusCodes.BAD_REQUEST
    );
}

export async function logout(uid: string) {}

export async function log(status: number, message: string, context?: string) {
  if (status >= 500) return LogModel.create({ status, message, context });
}
