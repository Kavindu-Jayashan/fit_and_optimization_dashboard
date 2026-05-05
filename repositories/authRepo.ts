import { IAuthRepository } from "../interfaces/IAuthRepository";
import { OTPRecord } from "../types/auth";

// prototype only - lost in server restart.
export function createAuthRepo(): IAuthRepository {
  const store = new Map<string, OTPRecord>();

  //   stores otp using email as a key
  //   one active code per user at a time
  function storeOTP(email: string, record: OTPRecord): void {
    store.set(email, record);
  }

  //   retrieve otp for verification
  function getOTP(email: string): OTPRecord | undefined {
    return store.get(email);
  }

  //   delete otp after use
  function deleteOTP(email: string): void {
    store.delete(email);
  }
  return { storeOTP, getOTP, deleteOTP };
}

// singleton instance shared across sent-otp and verify-otp routes.
export const authRepoInstance = createAuthRepo();
