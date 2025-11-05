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

// New unified Action interface
export interface Action {
    id: number;
    name: string;
    value: number; // Can be positive or negative
    type: 'positive' | 'negative';
    created_at?: string;
    updated_at?: string;
}

export interface Assignment {
    id: number;
    person_id: number;
    // Legacy fields (for backward compatibility)
    item_type?: 'reward' | 'punishment' | 'action';
    item_id?: number;
    item_name?: string;
    item_value?: number;
    // New action-based fields
    action_id?: number;
    action_name?: string;
    action_value?: number;
    assigned_at: string;
    person_name?: string;
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