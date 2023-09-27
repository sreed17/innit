import { T_Topic, TopicModel } from "../../models/topic.model";
import { CommunityModel } from "../../models/community.model";
import { StatsModel } from "../../models/stats.model";
import { MemberModel } from "../../models/member.model";
import {
  findManyFromModel,
  findByIdFromModel,
  findOneFromModel,
} from "../../models/transactions";
import { CustomError } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";
import dbConnection from "../../models/connection";

export async function createTopic(input: any, callback: (tid: string) => void) {
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
        // create the topic meta data
        const doc_topic = await TopicModel.create(input);
        //update n_topics in parent community
        await CommunityModel.findOneAndUpdate(
          { _id: parentId },
          { $inc: { n_topics: 1 } }
        );
        //update stats in owner
        await StatsModel.findOneAndUpdate(
          { _id: owner },
          { $inc: { n_topicsOwned: 1, n_topicsFollowed: 1 } }
        );
        // callback
        callback(doc_topic._id.toHexString());
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

export async function joinTopic(tid: string, input: any) {
  const { uid, communtiyId, role = "normal" } = input;
  if (
    typeof uid === "string" &&
    typeof communtiyId === "string" &&
    typeof role === "string"
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // create the member meta data
        const doc_member = await MemberModel.create({ ...input, topicId: tid });
        //update n_members
        await TopicModel.findOneAndUpdate(
          { _id: tid },
          { $inc: { n_members: 1 } }
        );
        //update stats in owner
        await StatsModel.findOneAndUpdate(
          { _id: uid },
          { $inc: { n_topicsFollowed: 1 } }
        );
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for joining the Topic",
      StatusCodes.BAD_REQUEST
    );
}

export async function leaveTopic(tid: string, uid: any) {
  if (typeof uid === "string") {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        // delete the membership meta data
        await MemberModel.deleteOne({
          topicId: tid,
          uid,
        });
        //update n_members
        await TopicModel.findOneAndUpdate(
          { _id: tid },
          { $inc: { n_members: -1 } }
        );
        //update stats in owner
        await StatsModel.findOneAndUpdate(
          { _id: uid },
          { $inc: { n_topicsFollowed: -1 } }
        );
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Invalid/Insufficient data for leaving the Topic",
      StatusCodes.BAD_REQUEST
    );
}

export async function findManyTopics(input: any) {
  return findManyFromModel<T_Topic>(TopicModel, input);
}

export async function findTopicById(id: string, query: any) {
  const { select } = query;
  return findByIdFromModel<T_Topic>(TopicModel, id, select);
}

export async function findOneTopic(filter: string, query: any) {
  const { select } = query;
  return findOneFromModel<T_Topic>(TopicModel, filter, select);
}

export async function updateTopic(id: string, updates: any) {
  if (updates != null) {
    return TopicModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  } else throw new CustomError("Updates data is null", StatusCodes.BAD_REQUEST);
}
