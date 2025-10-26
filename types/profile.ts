// Профиль пользователя
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  favorite_genres?: string[];
  reading_goal?: number; // Книг в год
  created_at: string;
  updated_at: string;
}

// Данные для обновления профиля
export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  favorite_genres?: string[];
  reading_goal?: number;
}

// Ответ API профиля
export interface ProfileApiResponse {
  profile: UserProfile;
  success: boolean;
  message?: string;
}

