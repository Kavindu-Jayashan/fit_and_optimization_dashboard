import { NextRequest, NextResponse } from "next/server";
import { createAuthService } from "../../../../lib/services/authService";
import { authRepoInstance } from "../../../../lib/repositories/authRepo";

// same instance used in send-otp so that
// in-memory OTP store is consistent across both routes


// verify the submitted OTp and set an httpOnly session cookie
export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 },
      );
    }

    const authService = createAuthService(authRepoInstance);
    const isValid = authService.verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "invalid or expired." },
        { status: 401 },
      );
    }

    // sets httpOnly cookie for session management
    const res = NextResponse.json({ success: true });
    

    return res;
  } catch (err) {
    console.error("Verify OTP error: ", err);
    return NextResponse.json(
      { error: "Verification failed. please try again." },
      { status: 500 },
    );
  }
}
