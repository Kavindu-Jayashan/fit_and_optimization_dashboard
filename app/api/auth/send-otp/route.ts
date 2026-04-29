import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "../../../../lib/otp";
import { sentOTPEmail } from "../../../../lib/sendEmail";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "valid email address is required!" },
        { status: 400 },
      );
    }

    const otp = generateOTP();
    storeOTP(email, otp);
    await sentOTPEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send otp error: ", err);
    return NextResponse.json(
      { error: "failed to send OTP. please try again." },
      { status: 500 },
    );
  }
}
