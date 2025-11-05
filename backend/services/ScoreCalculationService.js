const AssignmentRepository = require('../repositories/AssignmentRepository');
const PersonRepository = require('../repositories/PersonRepository');

/**
 * Service class for score calculation operations
 */
class ScoreCalculationService {
  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.personRepository = new PersonRepository();
  }

  /**
   * Get total scores for all persons
   * @returns {Promise<Array>} Array of person score objects with total scores
   */
  async getTotalScores() {
    const scores = await this.assignmentRepository.getTotalScores();
    
    // Enhance with additional calculated fields
    return scores.map(score => ({
      personId: score.person_id,
      personName: score.person_name,
      totalScore: parseInt(score.total_score) || 0,
      assignmentCount: parseInt(score.assignment_count) || 0,
      averageScore: score.assignment_count > 0 
        ? Math.round((score.total_score / score.assignment_count) * 100) / 100 
        : 0,
      rank: 0 // Will be set after sorting
    })).sort((a, b) => {
      // Sort by total score descending, then by name ascending
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.personName.localeCompare(b.personName);
    }).map((score, index) => ({
      ...score,
      rank: index + 1
    }));
  }

  /**
   * Get weekly scores for all persons
   * @param {Date} [weekStart] - Start of the week (defaults to current week Monday)
   * @returns {Promise<Array>} Array of person score objects with weekly scores
   */
  async getWeeklyScores(weekStart = null) {
    const scores = await this.assignmentRepository.getWeeklyScores(weekStart);
    
    // Enhance with additional calculated fields
    return scores.map(score => ({
      personId: score.person_id,
      personName: score.person_name,
      weeklyScore: parseInt(score.weekly_score) || 0,
      weeklyAssignmentCount: parseInt(score.weekly_assignment_count) || 0,
      weekStart: score.week_start,
      weekEnd: score.week_end,
      averageWeeklyScore: score.weekly_assignment_count > 0 
        ? Math.round((score.weekly_score / score.weekly_assignment_count) * 100) / 100 
        : 0,
      rank: 0 // Will be set after sorting
    })).sort((a, b) => {
      // Sort by weekly score descending, then by name ascending
      if (b.weeklyScore !== a.weeklyScore) {
        return b.weeklyScore - a.weeklyScore;
      }
      return a.personName.localeCompare(b.personName);
    }).map((score, index) => ({
      ...score,
      rank: index + 1
    }));
  }

  /**
   * Get score for a specific person
   * @param {number} personId - Person ID
   * @returns {Promise<Object>} Person score object with total and weekly scores
   * @throws {Error} If person not found
   */
  async getPersonScore(personId) {
    // Verify person exists
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error(`Persona con ID ${personId} no encontrada`);
    }

    // Get total score
    const totalScore = await this.assignmentRepository.getPersonScore(personId);
    
    // Get weekly score
    const weeklyScore = await this.assignmentRepository.getPersonWeeklyScore(personId);

    // Get person's rank in total scores
    const allTotalScores = await this.getTotalScores();
    const totalRank = allTotalScores.findIndex(s => s.personId === personId) + 1;

    // Get person's rank in weekly scores
    const allWeeklyScores = await this.getWeeklyScores();
    const weeklyRank = allWeeklyScores.findIndex(s => s.personId === personId) + 1;

    return {
      personId,
      personName: person.name,
      totalScore: parseInt(totalScore?.total_score) || 0,
      totalAssignmentCount: parseInt(totalScore?.assignment_count) || 0,
      totalRank,
      weeklyScore: parseInt(weeklyScore?.weekly_score) || 0,
      weeklyAssignmentCount: parseInt(weeklyScore?.weekly_assignment_count) || 0,
      weeklyRank,
      weekStart: weeklyScore?.week_start,
      weekEnd: weeklyScore?.week_end,
      averageTotalScore: totalScore?.assignment_count > 0 
        ? Math.round((totalScore.total_score / totalScore.assignment_count) * 100) / 100 
        : 0,
      averageWeeklyScore: weeklyScore?.weekly_assignment_count > 0 
        ? Math.round((weeklyScore.weekly_score / weeklyScore.weekly_assignment_count) * 100) / 100 
        : 0
    };
  }

  /**
   * Get weekly score for a specific person
   * @param {number} personId - Person ID
   * @param {Date} [weekStart] - Start of the week (defaults to current week Monday)
   * @returns {Promise<Object>} Person weekly score object
   * @throws {Error} If person not found
   */
  async getPersonWeeklyScore(personId, weekStart = null) {
    // Verify person exists
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error(`Persona con ID ${personId} no encontrada`);
    }

    const weeklyScore = await this.assignmentRepository.getPersonWeeklyScore(personId, weekStart);
    
    if (!weeklyScore) {
      // If no score found, return default values
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - daysToMonday);
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

      return {
        personId,
        personName: person.name,
        weeklyScore: 0,
        weeklyAssignmentCount: 0,
        weekStart: weekStart || currentWeekStart,
        weekEnd: currentWeekEnd,
        averageWeeklyScore: 0
      };
    }

    return {
      personId: weeklyScore.person_id,
      personName: weeklyScore.person_name,
      weeklyScore: parseInt(weeklyScore.weekly_score) || 0,
      weeklyAssignmentCount: parseInt(weeklyScore.weekly_assignment_count) || 0,
      weekStart: weeklyScore.week_start,
      weekEnd: weeklyScore.week_end,
      averageWeeklyScore: weeklyScore.weekly_assignment_count > 0 
        ? Math.round((weeklyScore.weekly_score / weeklyScore.weekly_assignment_count) * 100) / 100 
        : 0
    };
  }

  /**
   * Calculate current week start date (Monday)
   * @param {Date} [referenceDate] - Reference date (defaults to current date)
   * @returns {Date} Start of the week (Monday at 00:00:00)
   */
  getCurrentWeekStart(referenceDate = null) {
    const date = referenceDate || new Date();
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    return weekStart;
  }

  /**
   * Calculate week end date (Sunday)
   * @param {Date} weekStart - Start of the week
   * @returns {Date} End of the week (Sunday at 23:59:59)
   */
  getWeekEnd(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  /**
   * Get score comparison between two persons
   * @param {number} personId1 - First person ID
   * @param {number} personId2 - Second person ID
   * @returns {Promise<Object>} Comparison object
   * @throws {Error} If either person not found
   */
  async comparePersonScores(personId1, personId2) {
    const person1Score = await this.getPersonScore(personId1);
    const person2Score = await this.getPersonScore(personId2);

    const totalDifference = person1Score.totalScore - person2Score.totalScore;
    const weeklyDifference = person1Score.weeklyScore - person2Score.weeklyScore;

    return {
      person1: person1Score,
      person2: person2Score,
      comparison: {
        totalScoreDifference: totalDifference,
        weeklyScoreDifference: weeklyDifference,
        totalScoreLeader: totalDifference > 0 ? person1Score.personName : 
                         totalDifference < 0 ? person2Score.personName : 'Empate',
        weeklyScoreLeader: weeklyDifference > 0 ? person1Score.personName : 
                          weeklyDifference < 0 ? person2Score.personName : 'Empate'
      }
    };
  }

  /**
   * Get score statistics across all persons
   * @returns {Promise<Object>} Score statistics
   */
  async getScoreStatistics() {
    const totalScores = await this.getTotalScores();
    const weeklyScores = await this.getWeeklyScores();

    if (totalScores.length === 0) {
      return {
        totalPersons: 0,
        totalScoreStats: { min: 0, max: 0, average: 0, median: 0 },
        weeklyScoreStats: { min: 0, max: 0, average: 0, median: 0 },
        topPerformer: null,
        bottomPerformer: null,
        weeklyTopPerformer: null
      };
    }

    // Calculate total score statistics
    const totalScoreValues = totalScores.map(s => s.totalScore);
    const totalScoreSum = totalScoreValues.reduce((sum, score) => sum + score, 0);
    const sortedTotalScores = [...totalScoreValues].sort((a, b) => a - b);
    
    const totalScoreStats = {
      min: Math.min(...totalScoreValues),
      max: Math.max(...totalScoreValues),
      average: Math.round((totalScoreSum / totalScores.length) * 100) / 100,
      median: sortedTotalScores.length % 2 === 0
        ? (sortedTotalScores[sortedTotalScores.length / 2 - 1] + sortedTotalScores[sortedTotalScores.length / 2]) / 2
        : sortedTotalScores[Math.floor(sortedTotalScores.length / 2)]
    };

    // Calculate weekly score statistics
    const weeklyScoreValues = weeklyScores.map(s => s.weeklyScore);
    const weeklyScoreSum = weeklyScoreValues.reduce((sum, score) => sum + score, 0);
    const sortedWeeklyScores = [...weeklyScoreValues].sort((a, b) => a - b);
    
    const weeklyScoreStats = {
      min: Math.min(...weeklyScoreValues),
      max: Math.max(...weeklyScoreValues),
      average: weeklyScores.length > 0 ? Math.round((weeklyScoreSum / weeklyScores.length) * 100) / 100 : 0,
      median: weeklyScores.length > 0 ? (
        sortedWeeklyScores.length % 2 === 0
          ? (sortedWeeklyScores[sortedWeeklyScores.length / 2 - 1] + sortedWeeklyScores[sortedWeeklyScores.length / 2]) / 2
          : sortedWeeklyScores[Math.floor(sortedWeeklyScores.length / 2)]
      ) : 0
    };

    return {
      totalPersons: totalScores.length,
      totalScoreStats,
      weeklyScoreStats,
      topPerformer: totalScores[0] || null,
      bottomPerformer: totalScores[totalScores.length - 1] || null,
      weeklyTopPerformer: weeklyScores[0] || null
    };
  }

  /**
   * Get score trends for a person over time
   * @param {number} personId - Person ID
   * @param {number} [weeks=4] - Number of weeks to analyze
   * @returns {Promise<Array>} Array of weekly score objects
   * @throws {Error} If person not found
   */
  async getPersonScoreTrends(personId, weeks = 4) {
    // Verify person exists
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error(`Persona con ID ${personId} no encontrada`);
    }

    const trends = [];
    const currentWeekStart = this.getCurrentWeekStart();

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - (i * 7));
      
      const weeklyScore = await this.getPersonWeeklyScore(personId, weekStart);
      trends.unshift(weeklyScore); // Add to beginning to maintain chronological order
    }

    return trends;
  }
}

module.exports = ScoreCalculationService;