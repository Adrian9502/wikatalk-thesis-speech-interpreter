const UserProgress = require('../models/userProgress.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Cache rankings for 5 minutes to improve performance
const rankingCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getRankingKey = (type, gameMode = null) => {
  return gameMode ? `${type}_${gameMode}` : type;
};

const getCachedRanking = (key) => {
  const cached = rankingCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedRanking = (key, data) => {
  rankingCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getRankings = async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    const userId = req.user._id;

    console.log(`[Rankings] Fetching ${type} rankings`);

    // Check cache first
    const cacheKey = getRankingKey(type);
    const cached = getCachedRanking(cacheKey);

    if (cached) {
      console.log(`[Rankings] Returning cached ${type} rankings`);
      return res.json({
        success: true,
        data: cached
      });
    }

    let rankings = [];
    let userRank = null;

    // Get rankings based on type
    switch (type) {
      case 'quizChampions':
        rankings = await getQuizChampions(limit);
        userRank = await getUserQuizRank(userId);
        break;

      case 'coinMasters':
        rankings = await getCoinMasters(limit);
        userRank = await getUserCoinRank(userId);
        break;

      case 'speedDemons':
        rankings = await getSpeedDemons(limit);
        userRank = await getUserSpeedRank(userId);
        break;

      case 'consistencyKings':
        rankings = await getConsistencyKings(limit);
        userRank = await getUserConsistencyRank(userId);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid ranking type'
        });
    }

    const result = {
      rankings,
      userRank,
      totalCount: rankings.length,
      lastUpdated: new Date().toISOString()
    };

    // Cache the result
    setCachedRanking(cacheKey, result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Rankings] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rankings'
    });
  }
};

// Quiz Champions - Most quizzes completed
const getQuizChampions = async (limit) => {
  return await UserProgress.aggregate([
    { $match: { completed: true } },
    {
      $group: {
        _id: '$userId',
        totalCompleted: { $sum: 1 },
        totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.profilePicture',
        value: '$totalCompleted',
        totalCompleted: '$totalCompleted',
        lastActive: '$user.lastLoginDate'
      }
    },
    { $sort: { value: -1 } },
    { $limit: parseInt(limit) }
  ]);
};

// Coin Masters - Highest coin balances
const getCoinMasters = async (limit) => {
  return await User.aggregate([
    { $match: { coins: { $exists: true, $gte: 0 } } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$username',
        avatar: '$profilePicture',
        value: '$coins',
        coins: '$coins',
        lastActive: '$lastLoginDate'
      }
    },
    { $sort: { value: -1 } },
    { $limit: parseInt(limit) }
  ]);
};

// Speed Demons - Best average completion times
const getSpeedDemons = async (limit) => {
  return await UserProgress.aggregate([
    { $match: { completed: true, totalTimeSpent: { $gt: 0 } } },
    {
      $group: {
        _id: '$userId',
        avgTime: { $avg: '$totalTimeSpent' },
        totalCompleted: { $sum: 1 },
        bestTime: { $min: '$totalTimeSpent' }
      }
    },
    { $match: { totalCompleted: { $gte: 5 } } }, // Only users with at least 5 completions
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.profilePicture',
        value: { $round: ['$avgTime', 2] },
        avgTime: { $round: ['$avgTime', 2] },
        bestTime: { $round: ['$bestTime', 2] },
        totalCompleted: '$totalCompleted',
        lastActive: '$user.lastLoginDate'
      }
    },
    { $sort: { value: 1 } }, // Ascending order (faster is better)
    { $limit: parseInt(limit) }
  ]);
};

// Consistency Kings - Highest completion rates
const getConsistencyKings = async (limit) => {
  return await UserProgress.aggregate([
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } }
      }
    },
    { $match: { totalAttempts: { $gte: 10 } } }, // Only users with at least 10 attempts
    {
      $addFields: {
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$correctAttempts', '$totalAttempts'] }, 100] },
            1
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.profilePicture',
        value: '$completionRate',
        completionRate: '$completionRate',
        correctAttempts: '$correctAttempts',
        totalAttempts: '$totalAttempts',
        lastActive: '$user.lastLoginDate'
      }
    },
    { $sort: { value: -1, correctAttempts: -1 } },
    { $limit: parseInt(limit) }
  ]);
};

// User ranking functions
const getUserQuizRank = async (userId) => {
  if (!userId) return null;

  const userStats = await UserProgress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), completed: true } },
    {
      $group: {
        _id: '$userId',
        totalCompleted: { $sum: 1 }
      }
    }
  ]);

  if (!userStats.length) return null;

  const userCompleted = userStats[0].totalCompleted;

  const rank = await UserProgress.aggregate([
    { $match: { completed: true } },
    {
      $group: {
        _id: '$userId',
        totalCompleted: { $sum: 1 }
      }
    },
    {
      $match: {
        totalCompleted: { $gt: userCompleted }
      }
    },
    { $count: 'count' }
  ]);

  return {
    rank: (rank[0]?.count || 0) + 1,
    value: userCompleted
  };
};

const getUserCoinRank = async (userId) => {
  if (!userId) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const rank = await User.countDocuments({
    coins: { $gt: user.coins }
  });

  return {
    rank: rank + 1,
    value: user.coins
  };
};

const getUserSpeedRank = async (userId) => {
  if (!userId) return null;

  const userStats = await UserProgress.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        completed: true,
        totalTimeSpent: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$userId',
        avgTime: { $avg: '$totalTimeSpent' },
        totalCompleted: { $sum: 1 }
      }
    }
  ]);

  if (!userStats.length || userStats[0].totalCompleted < 5) return null;

  const userAvgTime = userStats[0].avgTime;

  const rank = await UserProgress.aggregate([
    { $match: { completed: true, totalTimeSpent: { $gt: 0 } } },
    {
      $group: {
        _id: '$userId',
        avgTime: { $avg: '$totalTimeSpent' },
        totalCompleted: { $sum: 1 }
      }
    },
    { $match: { totalCompleted: { $gte: 5 } } },
    {
      $match: {
        avgTime: { $lt: userAvgTime }
      }
    },
    { $count: 'count' }
  ]);

  return {
    rank: (rank[0]?.count || 0) + 1,
    value: Math.round(userAvgTime * 100) / 100
  };
};

const getUserConsistencyRank = async (userId) => {
  if (!userId) return null;

  const userStats = await UserProgress.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } }
      }
    }
  ]);

  if (!userStats.length || userStats[0].totalAttempts < 10) return null;

  const userRate = Math.round((userStats[0].correctAttempts / userStats[0].totalAttempts) * 100 * 10) / 10;

  const rank = await UserProgress.aggregate([
    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } }
      }
    },
    { $match: { totalAttempts: { $gte: 10 } } },
    {
      $addFields: {
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$correctAttempts', '$totalAttempts'] }, 100] },
            1
          ]
        }
      }
    },
    {
      $match: {
        completionRate: { $gt: userRate }
      }
    },
    { $count: 'count' }
  ]);

  return {
    rank: (rank[0]?.count || 0) + 1,
    value: userRate
  };
};

module.exports = {
  getRankings
};