import { IAuthRepository } from "../interfaces/IAuthRepository";
import { sentOTPEmail } from "../lib/sendEmail";

// handles all OTP authentication logic

export function createAuthService(authRepo: IAuthRepository) {
  // generate 6 digit OTP with 10 min expire time
  // send the OTP to the recruiter via ACS
  async function sendOTP(email: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    authRepo.storeOTP(email, {
      otp,
      expireAt: Date.now() + 10 * 60 * 1000,
    });
    await sentOTPEmail(email, otp);
  }

  // verify the submitted OTP against the stored record
  // enforce single-use and expiry by deleting after verification
  function verifyOTP(email: string, otp: string): boolean {
    const rec = authRepo.getOTP(email);
    if (!rec) return false;
    if (Date.now() > rec.expireAt) {
      authRepo.deleteOTP(email);
      return false;
    }
    if (rec?.otp !== otp) return false;
    authRepo.deleteOTP(email);
    return true;
  }
  return { sendOTP, verifyOTP };
}
