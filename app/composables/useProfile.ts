import type { UpdateProfileData, ProfileApiResponse } from '~~/types/profile';

export const useProfile = () => {
  /**
   * Получить профиль текущего пользователя
   */
  const getProfile = async () => {
    return await $fetch<ProfileApiResponse>('/api/profile');
  };

  /**
   * Обновить профиль
   */
  const updateProfile = async (data: UpdateProfileData) => {
    return await $fetch<ProfileApiResponse>('/api/profile', {
      method: 'PATCH',
      body: data,
    });
  };

  /**
   * Получить профиль с реактивностью
   */
  const fetchProfile = () => {
    return useFetch<ProfileApiResponse>('/api/profile', {
      key: 'user-profile',
    });
  };

  /**
   * Загрузить аватар
   */
  const uploadAvatar = async (file: File) => {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();

    if (!user.value) {
      throw new Error('Необходима авторизация');
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Загружаем файл в Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Ошибка при загрузке аватара');
    }

    // Получаем публичный URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  return {
    getProfile,
    updateProfile,
    fetchProfile,
    uploadAvatar,
  };
};

