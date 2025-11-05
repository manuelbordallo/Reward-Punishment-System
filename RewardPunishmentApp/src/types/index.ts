export interface Person {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: number;
  name: string;
  value: number; // Always positive
  createdAt: Date;
  updatedAt: Date;
}

export interface Punishment {
  id: number;
  name: string;
  value: number; // Always negative
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: number;
  personId: number;
  itemType: 'reward' | 'punishment';
  itemId: number;
  itemName: string;
  itemValue: number;
  assignedAt: Date;
  personName?: string; // Optional since it may not always be included
}

export interface PersonScore {
  personId: number;
  personName: string;
  totalScore: number;
  weeklyScore: number;
  assignmentCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}