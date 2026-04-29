const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(email: string, otp: string): void {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
}

export function verifyOTP(email: string, otp: string): boolean {
  const rec = otpStore.get(email);

  if (!rec) {
    return false;
  }

  if (Date.now() > rec.expiresAt) {
    otpStore.delete(email);
    return false;
  }

  if (rec.otp !== otp) {
    return false;
  }

  otpStore.delete(email);
  return true;
}
