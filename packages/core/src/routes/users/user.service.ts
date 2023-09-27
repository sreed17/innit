import { T_User, UserModel } from "../../models/user.model";
import { RelationshipModel } from "../../models/relationship.model";
import { StatsModel } from "../../models/stats.model";
import { ReportModel } from "../../models/report.model";
import { T_Liked, LikedModel } from "../../models/liked.model";
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

export async function findManyUsers(input: any) {
  return findManyFromModel<T_User>(UserModel, input);
}

export async function findUserById(id: string, query: any) {
  const { select } = query;
  return findByIdFromModel<T_User>(UserModel, id, select);
}

export async function findOneUser(filter: string, query: any) {
  const { select } = query;
  return findOneFromModel<T_User>(UserModel, filter, select);
}

export async function updateUser(id: string, updates: any) {
  if (updates != null) {
    return UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  } else throw new CustomError("Updates data is null", StatusCodes.BAD_REQUEST);
}

export async function addFriend(from: string, to: string) {
  const new_rel = new RelationshipModel({
    from,
    to,
    type: "friend",
    bidirectional: true,
    needConfirmation: true,
  });
  await new_rel.save();
}

export async function removeFriend(from: string, to: string) {
  const session = await dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const doc_rel = await RelationshipModel.findOne({
        from,
        to,
        type: "friend",
      });
      if (!doc_rel)
        throw new CustomError("No such relation found", StatusCodes.NOT_FOUND);
      if (doc_rel.isConfirmed) {
        // if the relationship is confirmed then delete the inverted edge
        await RelationshipModel.findOneAndDelete({
          to,
          from,
          type: "friend",
        });
      }
      await RelationshipModel.findOneAndDelete({
        from,
        to,
        type: "friend",
      });
      await StatsModel.findByIdAndUpdate(from, { $inc: { n_friends: -1 } });
      await StatsModel.findByIdAndUpdate(to, { $inc: { n_friends: -1 } });
    });
  } finally {
    session.endSession();
  }
}

export async function confirmFriendship(from: string, to: string) {
  const session = await dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      await RelationshipModel.create({
        from,
        to,
        type: "friend",
        bidirectional: true,
        needConfirmation: true,
        isConfirmed: true,
      });
      await RelationshipModel.findOneAndUpdate(
        { from: to, to: from, type: "friend" },
        { isConfirmed: true }
      );
      await StatsModel.findByIdAndUpdate(from, { $inc: { n_friends: 1 } });
      await StatsModel.findByIdAndUpdate(to, { $inc: { n_friends: 1 } });
    });
  } finally {
    session.endSession();
  }
}

export async function getFriends(uid: string, input: any) {
  const pipeline = [
    {
      $match: {
        from: toObjectId(uid),
      },
    },
    {
      $project: {
        friendId: "$to",
        isConfirmed: 1,
      },
    },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: "friendId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              photoUrl: 1,
              location: 1,
              gender: 1,
            },
          },
        ],
        as: "data",
      },
    },
    {
      $unwind: "$data",
    },
  ];

  const aggregate = RelationshipModel.aggregate(pipeline);
  const payload = await aggregate.exec();
  return {
    payload,
  };
}

export async function getUserStats(uid: string) {
  return StatsModel.findById(uid);
}

export async function reportUser(uid: string, input: any) {
  const { reason, priority = "normal" } = input;
  const session = await dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      await ReportModel.create({
        subject: uid,
        subjectOwner: uid,
        subjectType: "user",
        reason,
        priority,
      });
      await StatsModel.findByIdAndUpdate(uid, { $inc: { n_reports: 1 } });
      // TODO: update ban
    });
  } finally {
    session.endSession();
  }
}

export async function getLikedContents(uid: string, input: any) {
  return findManyFromModel<T_Liked>(LikedModel, input);
  // TODO: user aggregate
}
