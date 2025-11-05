// Re-export all async thunks for easy importing
export {
  fetchPersons,
  createPerson,
  updatePersonAsync,
  deletePerson,
} from './slices/personSlice';

export {
  fetchRewards,
  createReward,
  updateRewardAsync,
  deleteReward,
} from './slices/rewardSlice';

export {
  fetchPunishments,
  createPunishment,
  updatePunishmentAsync,
  deletePunishment,
} from './slices/punishmentSlice';

export {
  fetchAssignments,
  createAssignment,
  deleteAssignment,
  fetchTotalScores,
  fetchWeeklyScores,
} from './slices/assignmentSlice';