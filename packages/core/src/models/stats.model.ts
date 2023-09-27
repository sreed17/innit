import { Schema, Types, InferSchemaType, model } from "mongoose";

/**
 * @swagger
 * components:
 *    schemas:
 *            Stats:
 *                 type: object
 *                 required: [_id, createdAt, updatedAt]
 *                 description: Different Stats of the user, used to score the users achivements
 *                 properties:
 *                            _id:
 *                                type: string
 *                                description: Auto-generated unique ID
 *                            createdAt:
 *                                type: number
 *                                description: Timestamp of the created date-time
 *                            updatedAt:
 *                                type: number
 *                                description: Timestamp of the modified date-time
 *                            n_likes:
 *                                type: number
 *                                description: Number of likes received cummulatively by all the user's posts
 *                                default: 0
 *                            n_profileViews:
 *                                type: number,
 *                                description: Number of profileViews received by the user
 *                            n_mentions:
 *                                type: number
 *                                description: Total number of mentions received by the user
 *                                default: 0
 *                            n_friends:
 *                                type: number
 *                                description: Total number of friends
 *                                default: 0
 *                            n_topicsOwned:
 *                                type: number
 *                                description: Total number of topics created by user
 *                                default: 0
 *                            n_communitiesOwned:
 *                                type: number
 *                                default: 0
 *                                description: Total number of communities created by the user
 *                            n_topicsFollowed:
 *                                type: number
 *                                default: 0
 *                                description: Total topics followed by user, including once own topics
 *                            n_communitiesFollowed:
 *                                type: number
 *                                default: 0
 *                                description: Total communities, the user has membership, including once own communities
 *                            n_reports:
 *                                type: number
 *                                description: Total number of reports received by the user
 *                                default: 0
 *                            n_bans:
 *                                type: number
 *                                description: Total number of bans recieived by the user
 *                            score:
 *                                type: number
 *                                default: 0
 *                                description: Impression value genereated by the user
 */

const StatsSchema = new Schema(
  {
    _id: Types.ObjectId,
    n_likes: { type: Number, default: 0 },
    n_profileViews: { type: Number, default: 0 },
    n_mentions: { type: Number, default: 0 },
    n_friends: { type: Number, default: 0 },
    n_topicsOwned: { type: Number, default: 0 },
    n_communitiesOwned: { type: Number, default: 0 },
    n_topicsFollowed: { type: Number, default: 0 },
    n_communitiesFollowed: { type: Number, default: 0 },
    n_reports: { type: Number, default: 0 },
    n_bans: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

export type T_Stats = InferSchemaType<typeof StatsSchema>;

export const StatsModel = model("Stats", StatsSchema);
export default StatsModel;
