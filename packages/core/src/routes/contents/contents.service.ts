import {
  T_TopicContent,
  TopicContentModel,
} from "../../models/topiccontent.model";
import { TopicModel } from "../../models/topic.model";
import { LikedModel } from "../../models/liked.model";
import { StatsModel } from "../../models/stats.model";
import { ReportModel } from "../../models/report.model";
import {
  findManyFromModel,
  findByIdFromModel,
  findOneFromModel,
} from "../../models/transactions";
import { CustomError } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";
import dbConnection from "../../models/connection";

export async function createContent(
  input: any,
  callback: (cid: string) => void
) {
  const { name, owner, parentId, tags } = input;
  if (
    typeof name === "string" &&
    typeof owner === "string" &&
    typeof parentId === "string" &&
    Array.isArray(tags)
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // create the TopicContent meta data
        const doc_content = await TopicContentModel.create(input);
        //update n_contents in parent topic
        await TopicModel.findOneAndUpdate(
          { _id: parentId },
          { $inc: { n_contents: 1 } }
        );
        // callback
        callback(doc_content._id.toHexString());
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for creating a Topic",
      StatusCodes.BAD_REQUEST
    );
}

export async function deleteContent(cid: string) {
  if (cid.trim() != "") {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // create the TopicContent meta data
        const doc_content = await TopicContentModel.findById(cid);
        //update n_contents in parent topic
        await TopicModel.findOneAndUpdate(
          { _id: doc_content?.parentId },
          { $inc: { n_contents: -1 } }
        );
        // remove all liked marks
        await LikedModel.deleteMany({ subject: cid });
        // TODO: reflect this on user stats n_liked
      });
    } finally {
      session.endSession();
    }
  } else throw new CustomError("Invalid content id", StatusCodes.BAD_REQUEST);
}

export async function likeContent(cid: string, input: any) {
  const { subjectOwner, by } = input;
  if (
    cid.trim() != "" &&
    typeof subjectOwner === "string" &&
    typeof by === "string"
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // TODO: make sure that the like is unique for a (content,user)

        // create the TopicContent meta data
        const doc_content = await LikedModel.create({
          subject: cid,
          subjectOwner,
          by,
        });
        //update n_contents in parent topic
        await TopicContentModel.findOneAndUpdate(
          { _id: cid },
          { $inc: { n_likes: 1 } }
        );
        // update subjectOwner stats n_likes
        await StatsModel.findOneAndUpdate(
          { _id: subjectOwner },
          { $inc: { n_likes: 1 } }
        );
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for liking the content",
      StatusCodes.BAD_REQUEST
    );
}

export async function unlikeContent(cid: string, input: any) {
  const { subjectOwner, by } = input;
  if (
    cid.trim() != "" &&
    typeof subjectOwner === "string" &&
    typeof by === "string"
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // TODO: make sure that the like is unique for a (content,user) and like already exists
        // create the TopicContent meta data
        const doc_content = await LikedModel.deleteOne({
          subject: cid,
          subjectOwner,
          by,
        });
        //update n_contents in parent topic
        await TopicContentModel.findOneAndUpdate(
          { _id: cid },
          { $inc: { n_likes: -1 } }
        );
        // update subjectOwner stats n_likes
        await StatsModel.findOneAndUpdate(
          { _id: subjectOwner },
          { $inc: { n_likes: -1 } }
        );
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for liking the content",
      StatusCodes.BAD_REQUEST
    );
}

export async function reportContent(cid: string, input: any) {
  const { subjectOwner, reason, priority = "normal" } = input;
  if (
    cid.trim() != "" &&
    typeof subjectOwner === "string" &&
    typeof reason === "string"
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        await ReportModel.create({
          subject: cid,
          subjectOwner,
          subjectType: "content",
          reason,
          priority,
        });
        //update n_contents in parent topic
        await TopicContentModel.findOneAndUpdate(
          { _id: cid },
          { $inc: { n_reports: 1 } }
        );
        // update subjectOwner stats n_likes
        await StatsModel.findOneAndUpdate(
          { _id: subjectOwner },
          { $inc: { n_reports: 1 } }
        );
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for liking the content",
      StatusCodes.BAD_REQUEST
    );
}
export async function findManyContents(input: any) {
  return findManyFromModel<T_TopicContent>(TopicContentModel, input);
}

export async function findContentById(id: string, query: any) {
  const { select } = query;
  return findByIdFromModel<T_TopicContent>(TopicContentModel, id, select);
}

export async function findOneContent(filter: string, query: any) {
  const { select } = query;
  return findOneFromModel<T_TopicContent>(TopicContentModel, filter, select);
}

export async function updateContent(id: string, updates: any) {
  if (updates != null) {
    return TopicContentModel.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();
  } else throw new CustomError("Updates data is null", StatusCodes.BAD_REQUEST);
}
