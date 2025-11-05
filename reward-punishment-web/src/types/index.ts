export interface Person {
    id: number;
    name: string;
    created_at?: string;
}

export interface Reward {
    id: number;
    name: string;
    value: number;
    created_at?: string;
}

export interface Punishment {
    id: number;
    name: string;
    value: number;
    created_at?: string;
}

export interface Assignment {
    id: number;
    person_id: number;
    item_type: 'reward' | 'punishment';
    item_id: number;
    assigned_at: string;
    person_name?: string;
    item_name?: string;
    item_value?: number;
}

export interface Score {
    personId: number;
    personName: string;
    totalScore: number;
    assignmentCount: number;
    averageScore: number;
    rank: number;
}

export interface WeeklyScore {
    personId: number;
    personName: string;
    weeklyScore: number;
    weeklyAssignmentCount: number;
    weekStart: string;
    weekEnd: string;
    averageWeeklyScore: number;
    rank: number;
}