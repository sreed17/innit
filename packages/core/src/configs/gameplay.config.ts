type ScoreParams = {
  n_likes: number;
  n_profileViews: number;
  n_mentions: number;
  n_friends: number;
  n_topicsOwned: number;
  n_communitiesOwned: number;
  n_topicsFollowed: number;
  n_communitiesFollowed: number;
  n_reports: number;
};

export default {
  timeperiods: {
    bans: {
      normal: 24 * 60 * 60 * 1000,
      high: 7 * 24 * 60 * 60 * 1000,
      critical: -1,
    },
  },
  thresholds: {
    ban: {
      topic: 10, // Number of reports to issue ban
      community: 10, // Number of reports to issue ban on community
      content: 10, // Number of reports needed to issue ban on content
      user: 10, // Number of reports required to issue user ban on user
    },
  },
  scoreAlg: ({
    n_likes,
    n_profileViews,
    n_mentions,
    n_friends,
    n_topicsOwned,
    n_communitiesOwned,
    n_topicsFollowed,
    n_communitiesFollowed,
    n_reports,
  }: ScoreParams) => {
    // TODO: define the algorithm
    const favourability = n_likes;
    const social = n_profileViews + n_mentions + n_friends;
    const involvement =
      n_topicsOwned +
      n_communitiesOwned +
      n_communitiesFollowed +
      n_topicsFollowed;
    const negatives = n_reports;
    return (favourability + social + involvement - negatives) / 10;
  },
};
