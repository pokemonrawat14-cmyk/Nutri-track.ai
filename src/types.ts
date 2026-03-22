export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  goal: 'lose' | 'maintain' | 'gain';
  dailyCalorieTarget: number;
}

export interface MealLog {
  id: string;
  timestamp: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: 'text' | 'photo';
  imageUrl?: string;
}

export interface DailyStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
