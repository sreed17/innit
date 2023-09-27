import { T_Topic, TopicModel } from "../../models/topic.model";
import { CommunityModel } from "../../models/community.model";
import { StatsModel } from "../../models/stats.model";
import { T_Member, MemberModel } from "../../models/member.model";
import {
  findManyFromModel,
  findByIdFromModel,
  findOneFromModel,
} from "../../models/transactions";
import { CustomError } from "../../utils/handlers";
import { StatusCodes } from "http-status-codes";

// TODO: convert them to aggregates and join with user collection

export async function findManyMembers(input: any) {
  return findManyFromModel<T_Member>(MemberModel, input);
}

export async function findMemberById(id: string, query: any) {
  const { select } = query;
  return findByIdFromModel<T_Member>(MemberModel, id, select);
}

export async function updateMember(id: string, updates: any) {
  if (updates != null) {
    return MemberModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  } else throw new CustomError("Updates data is null", StatusCodes.BAD_REQUEST);
}
