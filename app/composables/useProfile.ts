import type { UpdateProfileData, ProfileApiResponse } from "~~/types/profile";
import { API_URL } from "~/constants";
import { createAuthHeaders } from "~/utils/auth";

export const useProfile = () => {
  /**
   * Получить профиль текущего пользователя
   */
  const getProfile = async () => {
    const authConfig = await createAuthHeaders();
    return await useFetch<ProfileApiResponse>(API_URL + "/profile", authConfig);
  };

  /**
   * Обновить профиль
   */
  const updateProfile = async (data: UpdateProfileData) => {
    const authConfig = await createAuthHeaders();
    return await useFetch<ProfileApiResponse>(API_URL + "/profile", {
      method: "PATCH",
      body: data,
      ...authConfig,
    });
  };

  /**
   * Получить профиль с реактивностью
   */
  const fetchProfile = async () => {
    const authConfig = await createAuthHeaders();
    return useFetch<ProfileApiResponse>(API_URL + "/profile", {
      key: "user-profile",
      ...authConfig,
    });
  };

  /**
   * Загрузить аватар
   */
  const uploadAvatar = async (file: File) => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();

    if (!user.value) {
      throw new Error("Необходима авторизация");
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Загружаем файл в Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error("Ошибка при загрузке аватара");
    }

    // Получаем публичный URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    getProfile,
    updateProfile,
    fetchProfile,
    uploadAvatar,
  };
};
