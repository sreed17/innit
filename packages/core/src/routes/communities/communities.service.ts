import { T_Community, CommunityModel } from "../../models/community.model";
import { TopicModel } from "../../models/topic.model";
import { MemberModel } from "../../models/member.model";
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
import { toObjectId } from "../../utils/db";
import gameplayConfig from "../../configs/gameplay.config";

export async function createCommunity(
  input: any,
  callback: (communityId: string, topicId: string) => void
) {
  const { name, owner, interests, ...other } = input;
  if (
    typeof name === "string" &&
    name.trim() !== "" &&
    typeof owner === "string" &&
    owner.trim() !== "" &&
    Array.isArray(interests)
  ) {
    const session = await dbConnection.startSession();
    try {
      await session.withTransaction(async () => {
        const doc_cm = await CommunityModel.create({
          ...input,
          n_topics: 1,
        });
        // create default topic with the same name as the community
        const doc_topic = await TopicModel.create({
          name,
          owner,
          parentId: doc_cm._id,
          n_members: 1,
          tags: ["auto-generated"],
          private: input.private ?? false,
          ...other,
        });
        // update user stats
        await StatsModel.findByIdAndUpdate(owner, {
          $inc: { n_communitiesOwned: 1, n_communitiesFollowed: 1 },
        });
        // define the membership
        await MemberModel.create({
          uid: owner,
          communityId: doc_cm._id,
          topicId: doc_topic._id,
          role: "owner",
        });
        callback(doc_cm._id.toHexString(), doc_topic._id.toHexString());
      });
    } finally {
      session.endSession();
    }
  } else
    throw new CustomError(
      "Insufficient data to create the community",
      StatusCodes.BAD_REQUEST
    );
}

export async function findManyCommunities(input: any) {
  return findManyFromModel<T_Community>(CommunityModel, input);
}

export async function findCommunityById(id: string, query: any) {
  const { select } = query;
  return findByIdFromModel<T_Community>(CommunityModel, id, select);
}

export async function findOneCommunity(filter: string, query: any) {
  const { select } = query;
  return findOneFromModel<T_Community>(CommunityModel, filter, select);
}

export async function updateCommunity(id: string, updates: any) {
  if (updates != null) {
    return CommunityModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  } else throw new CustomError("Updates data is null", StatusCodes.BAD_REQUEST);
}
