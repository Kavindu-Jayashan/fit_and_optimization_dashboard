import { OTPRecord } from "../types/auth";

export interface IAuthRepository {
  storeOTP(email: string, record: OTPRecord): void;
  getOTP(email: string): OTPRecord | undefined;
  deleteOTP(email: string): void;
}
