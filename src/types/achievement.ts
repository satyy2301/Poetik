export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  xp_reward: number;
};

export type UserAchievement = Achievement & {
  earned_at: string;
};

export type UserStats = {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesCompleted: number;
  challengesCompleted: number;
  hasPerfectQuiz: boolean;
};
