"use client";
import { LoginForm } from "../../components/login-form";

export default function LoginPage() {
  return (
    <main className=" min-h-screen bg-[#0c0c0e] flex items-center justify-center">
      <div className="w-100 h-auto">
        <LoginForm />
      </div>
    </main>
  );
}
