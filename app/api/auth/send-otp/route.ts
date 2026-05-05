import { NextRequest, NextResponse } from "next/server";
import { createAuthService } from "../../../../services/authService";
import { authRepoInstance } from "../../../../repositories/authRepo";

// same instance used in verify-otp so that
// in-memory OTP store is consistent across both routes
const authService = createAuthService(authRepoInstance);


// validate email and trigger OTP generation and delivery
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "valid email address is required!" },
        { status: 400 },
      );
    }

    await authService.sendOTP(email);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send otp error: ", err);
    return NextResponse.json(
      { error: "failed to send OTP. please try again." },
      { status: 500 },
    );
  }
}
