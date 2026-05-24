export enum Gender {
  MALE = "Male",
  FEMALE = "Female"
}

export enum ActivityLevel {
  SEDENTARY = "Sedentary",
  LIGHT = "Light",
  MODERATE = "Moderate",
  ACTIVE = "Active",
  VERY_ACTIVE = "VeryActive"
}

export enum AthleteType {
  GENERAL = "General Public",
  ENTHUSIAST = "Fitness Enthusiast",
  ATHLETE = "Athlete"
}

export interface UserProfile {
  uid: string;
  email: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  athleteType: AthleteType;
  createdAt: any; // Timestamp
  updatedAt: any; // Timestamp
}

export interface HistoryEntry {
  id: string;
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  athleteType: AthleteType;
  bmi: number;
  tdee: number;
  createdAt: any; // Timestamp
}

export interface SystemLog {
  id: string;
  type: string;
  userId: string;
  userEmail: string;
  details: string;
  createdAt: any; // Timestamp
}

export interface CalculationResult {
  bmi: number;
  bmiStatus: string;
  bmiColor: string;
  tdee: number;
  fatLoss: number;
  maintenance: number;
  muscleGain: number;
  showAthleteNotice: boolean;
}
