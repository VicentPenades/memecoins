import { Repository } from "~/app/utils/repository";
import type {
  PublicUser,
  UpdateProfileBody,
  UpdateEmailBody,
  UpdatePasswordBody,
} from "../types/user.types";

class UserRepository extends Repository {
  updateProfile(body: UpdateProfileBody) {
    return this.httpPut<PublicUser>("/api/general-settings/user/profile", body);
  }
  updateEmail(body: UpdateEmailBody) {
    return this.httpPut<PublicUser>("/api/general-settings/user/email", body);
  }
  updatePassword(body: UpdatePasswordBody) {
    return this.httpPut<{ success: boolean }>("/api/general-settings/user/password", body);
  }
}

export const userRepository = new UserRepository();
