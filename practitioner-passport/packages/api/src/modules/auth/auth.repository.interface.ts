import { PendingSignupEntity, Role, UserEntity } from "../../shared/types/auth.types";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  saveOrUpdateUnverifiedUser(entry: PendingSignupEntity): Promise<void>;
  savePendingSignup(entry: PendingSignupEntity): Promise<void>;
  findPendingSignupByToken(token: string): Promise<PendingSignupEntity | null>;
  removePendingSignupByToken(token: string): Promise<void>;
  verifySignupByToken(token: string): Promise<PendingSignupEntity | null>;
  upsertDemoSessionUser(entry: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    studentId: string | null;
    passwordHash: string;
  }): Promise<UserEntity>;
}
