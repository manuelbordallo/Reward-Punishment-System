import { apiService } from './api';
import { PersonScore, ApiResponse } from '../types';

export interface WeeklyScoreParams {
    weekStart?: string; // ISO date string, defaults to current week
}

export interface PersonScoreDetails extends PersonScore {
    rewardCount: number;
    punishmentCount: number;
    rewardTotal: number;
    punishmentTotal: number;
}

class ScoreService {
    private readonly endpoint = '/scores';

    async getTotalScores(): Promise<ApiResponse<PersonScore[]>> {
        return apiService.get<PersonScore[]>(`${this.endpoint}/total`);
    }

    async getWeeklyScores(params?: WeeklyScoreParams): Promise<ApiResponse<PersonScore[]>> {
        const queryParams = new URLSearchParams();
        if (params?.weekStart) {
            queryParams.append('weekStart', params.weekStart);
        }

        const query = queryParams.toString();
        const url = query ? `${this.endpoint}/weekly?${query}` : `${this.endpoint}/weekly`;

        return apiService.get<PersonScore[]>(url);
    }

    async getPersonScore(personId: number): Promise<ApiResponse<PersonScoreDetails>> {
        return apiService.get<PersonScoreDetails>(`${this.endpoint}/person/${personId}`);
    }

    async getPersonWeeklyScore(
        personId: number,
        params?: WeeklyScoreParams
    ): Promise<ApiResponse<PersonScoreDetails>> {
        const queryParams = new URLSearchParams();
        if (params?.weekStart) {
            queryParams.append('weekStart', params.weekStart);
        }

        const query = queryParams.toString();
        const url = query
            ? `${this.endpoint}/person/${personId}/weekly?${query}`
            : `${this.endpoint}/person/${personId}/weekly`;

        return apiService.get<PersonScoreDetails>(url);
    }

    async getCurrentWeekDates(): Promise<ApiResponse<{ weekStart: string; weekEnd: string }>> {
        return apiService.get<{ weekStart: string; weekEnd: string }>(`${this.endpoint}/current-week`);
    }
}

export const scoreService = new ScoreService();