"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  function startResendTimer() {
    setResendSeconds(30);
    timerRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSendOTP() {
    setError("");
    if (!email || !email.includes("@")) {
      setError("please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setStep("otp");
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      setError(error.message || "failed to sent the code try again!");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        otp: otp.join(""),
        redirect: false,
      });

      if (result.error) throw new Error("session creation failed");

      setSuccess("Verified! Redirecting...");
      setTimeout(() => router.push("/jobs"), 1000);
    } catch (error: any) {
      setError(error.message || "invalid or expired code!");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      const response = await fetch(`/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSuccess("new code sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
      startResendTimer();
    } catch (error: any) {
      setError(error.message || "failed to resend. please try again.");
    }
  }

  function handleOTPChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOTPPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    paste.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
  }

  function handleOTPKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const newOtp = [...otp];
      newOtp[idx - 1] = "";
      setOtp(newOtp);
      otpRefs.current[idx - 1]?.focus();
    }
  }

  const otpComplete = otp.every((d) => d.length === 1);

  return (
    <>
      {step === "email" ? (
        <>
          <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        placeholder="m@example.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      />
                    </Field>
                    <Field>
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                      >
                        Login
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="mb-7">
            <h1
              className="text-3xl mb-1.5"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
              }}
            >
              Check your inbox
            </h1>
            <p className="text-sm text-[#9b9ba3] font-light leading-relaxed">
              We sent a 6-digit code. It expires in 10 minutes.
            </p>
          </div>

          {/* Email badge */}
          <div className="flex items-center gap-2 px-3.5 py-3  border border-[#4a7c59]/20 rounded-xl mb-5">
            <svg
              className="w-3.5 h-3.5 text-[#4a7c59] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            <span className="text-xs text-[#9b9ba3]">
              Sent to{" "}
              <strong className="text-[#f0ede8] font-medium">{email}</strong>
            </span>
          </div>

          {/* OTP inputs */}
          <div className="mb-1">
            <label className="block text-[11px] font-medium text-[#9b9ba3] uppercase tracking-widest mb-2">
              One-time code
            </label>
            <div className="flex gap-2.5" onPaste={handleOTPPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                  className={`w-12 h-14 text-center text-xl font-medium bg-[#141416] border rounded-xl text-[#f0ede8] outline-none transition-all focus:-translate-y-0.5 focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 ${digit ? "border-[#4a7c59] bg-[#4a7c59]/6" : "border-[#242428]"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || !otpComplete}
            className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30 mt-4"
          >
            {loading ? "Verifying..." : "Verify & sign in"}
          </button>

          {/* Resend */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[#6b6b72]">Didn't receive it?</span>
            <button
              onClick={handleResend}
              disabled={resendSeconds > 0}
              className="text-xs text-[#5a9c6e] disabled:opacity-40 bg-none border-none cursor-pointer transition-opacity"
            >
              {resendSeconds > 0
                ? `Resend in ${resendSeconds}s`
                : "Resend code"}
            </button>
          </div>

          <button
            onClick={() => {
              setStep("email");
              setOtp(["", "", "", "", "", ""]);
              setError("");
              setSuccess("");
            }}
            className="w-full mt-3 bg-transparent border border-[#242428] hover:border-[#4a7c59] text-[#9b9ba3] hover:text-[#f0ede8] rounded-xl py-3 text-sm transition-all"
          >
            ← Use a different email
          </button>
        </>
      )}
      {/* Messages */}
      {error && (
        <p className="mt-3 text-xs text-[#c0614a] bg-[#c0614a]/8 border border-[#c0614a]/20 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-xs text-[#4a7c59] bg-[#4a7c59]/8 border border-[#4a7c59]/20 rounded-lg px-3.5 py-2.5">
          {success}
        </p>
      )}
    </>
  );
}
