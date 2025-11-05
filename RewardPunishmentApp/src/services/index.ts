// Base API service
export { apiService } from './api';

// Entity services
export { personService } from './PersonService';
export { rewardService } from './RewardService';
export { punishmentService } from './PunishmentService';
export { assignmentService } from './AssignmentService';
export { scoreService } from './ScoreService';

// Types for service requests
export type { CreatePersonRequest, UpdatePersonRequest } from './PersonService';
export type { CreateRewardRequest, UpdateRewardRequest } from './RewardService';
export type { CreatePunishmentRequest, UpdatePunishmentRequest } from './PunishmentService';
export type { CreateAssignmentRequest, AssignmentWithDetails } from './AssignmentService';
export type { WeeklyScoreParams, PersonScoreDetails } from './ScoreService';