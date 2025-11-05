import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { PersonScore } from '../types';

// Basic selectors
export const selectPersons = (state: RootState) => state.persons.persons;
export const selectRewards = (state: RootState) => state.rewards.rewards;
export const selectPunishments = (state: RootState) => state.punishments.punishments;
export const selectAssignments = (state: RootState) => state.assignments.assignments;
export const selectScores = (state: RootState) => state.assignments.scores;

// Loading states
export const selectPersonsLoading = (state: RootState) => state.persons.loading;
export const selectRewardsLoading = (state: RootState) => state.rewards.loading;
export const selectPunishmentsLoading = (state: RootState) => state.punishments.loading;
export const selectAssignmentsLoading = (state: RootState) => state.assignments.loading;

// Error states
export const selectPersonsError = (state: RootState) => state.persons.error;
export const selectRewardsError = (state: RootState) => state.rewards.error;
export const selectPunishmentsError = (state: RootState) => state.punishments.error;
export const selectAssignmentsError = (state: RootState) => state.assignments.error;

// UI selectors
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectUiError = (state: RootState) => state.ui.error;
export const selectCurrentScreen = (state: RootState) => state.ui.currentScreen;

// Derived data selectors
export const selectPersonById = createSelector(
    [selectPersons, (state: RootState, personId: number) => personId],
    (persons, personId) => persons.find(person => person.id === personId)
);

export const selectRewardById = createSelector(
    [selectRewards, (state: RootState, rewardId: number) => rewardId],
    (rewards, rewardId) => rewards.find(reward => reward.id === rewardId)
);

export const selectPunishmentById = createSelector(
    [selectPunishments, (state: RootState, punishmentId: number) => punishmentId],
    (punishments, punishmentId) => punishments.find(punishment => punishment.id === punishmentId)
);

// Assignment-related selectors
export const selectAssignmentsByPersonId = createSelector(
    [selectAssignments, (state: RootState, personId: number) => personId],
    (assignments, personId) => assignments.filter(assignment => assignment.personId === personId)
);

export const selectRecentAssignments = createSelector(
    [selectAssignments],
    (assignments) => {
        return assignments
            .slice()
            .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
            .slice(0, 10);
    }
);

// Score calculation selectors
export const selectCalculatedTotalScores = createSelector(
    [selectPersons, selectAssignments],
    (persons, assignments): PersonScore[] => {
        return persons.map(person => {
            const personAssignments = assignments.filter(a => a.personId === person.id);
            const totalScore = personAssignments.reduce((sum, assignment) => sum + assignment.itemValue, 0);

            return {
                personId: person.id,
                personName: person.name,
                totalScore,
                weeklyScore: 0, // Will be calculated separately
                assignmentCount: personAssignments.length,
            };
        }).sort((a, b) => b.totalScore - a.totalScore);
    }
);

export const selectCalculatedWeeklyScores = createSelector(
    [selectPersons, selectAssignments],
    (persons, assignments): PersonScore[] => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        return persons.map(person => {
            const personAssignments = assignments.filter(a => {
                const assignedDate = new Date(a.assignedAt);
                return a.personId === person.id &&
                    assignedDate >= startOfWeek &&
                    assignedDate <= endOfWeek;
            });

            const weeklyScore = personAssignments.reduce((sum, assignment) => sum + assignment.itemValue, 0);
            const totalScore = assignments
                .filter(a => a.personId === person.id)
                .reduce((sum, assignment) => sum + assignment.itemValue, 0);

            return {
                personId: person.id,
                personName: person.name,
                totalScore,
                weeklyScore,
                assignmentCount: personAssignments.length,
            };
        }).sort((a, b) => b.weeklyScore - a.weeklyScore);
    }
);

// Week information selector
export const selectCurrentWeekInfo = createSelector(
    [],
    () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        return {
            startDate: startOfWeek,
            endDate: endOfWeek,
            weekNumber: getWeekNumber(now),
        };
    }
);

// Helper function to get week number
function getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Combined loading selector
export const selectAnyLoading = createSelector(
    [selectPersonsLoading, selectRewardsLoading, selectPunishmentsLoading, selectAssignmentsLoading, selectIsLoading],
    (personsLoading, rewardsLoading, punishmentsLoading, assignmentsLoading, uiLoading) => {
        return personsLoading || rewardsLoading || punishmentsLoading || assignmentsLoading || uiLoading;
    }
);

// Combined error selector
export const selectAnyError = createSelector(
    [selectPersonsError, selectRewardsError, selectPunishmentsError, selectAssignmentsError, selectUiError],
    (personsError, rewardsError, punishmentsError, assignmentsError, uiError) => {
        return personsError || rewardsError || punishmentsError || assignmentsError || uiError;
    }
);

// Statistics selectors
export const selectStatistics = createSelector(
    [selectPersons, selectRewards, selectPunishments, selectAssignments],
    (persons, rewards, punishments, assignments) => {
        const totalRewardsGiven = assignments.filter(a => a.itemType === 'reward').length;
        const totalPunishmentsGiven = assignments.filter(a => a.itemType === 'punishment').length;
        const totalPointsAwarded = assignments.reduce((sum, a) => sum + a.itemValue, 0);

        return {
            totalPersons: persons.length,
            totalRewards: rewards.length,
            totalPunishments: punishments.length,
            totalAssignments: assignments.length,
            totalRewardsGiven,
            totalPunishmentsGiven,
            totalPointsAwarded,
        };
    }
);