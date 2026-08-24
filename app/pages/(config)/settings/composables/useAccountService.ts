import { userRepository } from "../repositories/user.repository";
import type {
  Locale,
  UpdateProfileBody,
  UpdateEmailBody,
  UpdatePasswordBody,
} from "../types/user.types";

export const useAccountService = () => {
  const { fetch: refreshSession, loggedIn } = useUserSession();
  const { setLocale } = useI18n();

  const updateProfile = async (body: UpdateProfileBody) => {
    try {
      const updated = await userRepository.updateProfile(body);
      // Refrescamos la sesión para que el header muestre el nombre actualizado
      await refreshSession();
      return updated;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const updateEmail = async (body: UpdateEmailBody) => {
    try {
      const updated = await userRepository.updateEmail(body);
      await refreshSession();
      return updated;
    } catch (err) {
      console.error("Error updating email:", err);
      throw err;
    }
  };

  const updatePassword = async (body: UpdatePasswordBody) => {
    try {
      return await userRepository.updatePassword(body);
    } catch (err) {
      console.error("Error updating password:", err);
      throw err;
    }
  };

  // Cambia el idioma de la UI y lo persiste en la cuenta (si hay sesión)
  const setLanguage = async (locale: Locale) => {
    await setLocale(locale);
    if (loggedIn.value) await updateProfile({ language: locale });
  };

  return { updateProfile, updateEmail, updatePassword, setLanguage };
};
