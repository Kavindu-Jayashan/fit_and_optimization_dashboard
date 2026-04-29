import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "../../../../lib/otp";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 },
      );
    }

    const isValid = verifyOTP(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: "invalid or expired." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("session_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Verify OTP error: ", err);
    return NextResponse.json(
      { error: "Verification failed. please try again." },
      { status: 500 },
    );
  }
}
