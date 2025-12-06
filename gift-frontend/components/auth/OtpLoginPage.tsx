"use client";

import { FormEvent, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation";

type Step = "PHONE" | "OTP";

interface VerifyResponse {
  token: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function OtpLoginPage() {
  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const normalizePhone = (value: string) => {
    return value.replace(/\s+/g, "");
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post("/auth/send-otp", {
        phone: normalized,
      });
      setInfo("OTP has been sent to your phone.");
      setStep("OTP");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP sent to your phone.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.post("/auth/verify-otp", {
        phone: normalized,
        otp,
        name: name || undefined,
        email: email || undefined,
      });

      const data = res.data?.data as VerifyResponse | undefined;
      if (!data?.token || !data.user) {
        throw new Error("Invalid response from server.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setInfo("Login successful! Redirecting...");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to verify OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-sm md:p-6">
      <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
        Login / Signup with OTP
      </h1>
      <p className="mt-1 text-xs text-slate-500 md:text-sm">
        Enter your mobile number to receive an OTP and login securely.
      </p>

      {/* Step indicator */}
      <div className="mt-4 flex gap-2 text-[11px] md:text-xs">
        <div
          className={`flex-1 rounded-full px-3 py-1 text-center ${
            step === "PHONE"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          1. Mobile Number
        </div>
        <div
          className={`flex-1 rounded-full px-3 py-1 text-center ${
            step === "OTP"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          2. OTP Verification
        </div>
      </div>

      {/* Messages */}
      {info && (
        <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 md:text-xs">
          {info}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 md:text-xs">
          {error}
        </div>
      )}

      {step === "PHONE" ? (
        <form onSubmit={handleSendOtp} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 md:text-sm">
              Mobile Number
            </label>
            <div className="mt-1 flex rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs md:text-sm">
              <span className="flex items-center pr-2 text-slate-600 border-r border-slate-200 mr-2">
                +91
              </span>
              <input
                type="tel"
                className="flex-1 bg-transparent outline-none"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <p className="mt-1 text-[10px] text-slate-400 md:text-xs">
              We will send you an OTP on this number.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded bg-brand-primary py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-sm"
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 md:text-sm">
              Mobile Number
            </label>
            <div className="mt-1 flex rounded border border-slate-300 bg-slate-50 px-2 py-1.5 text-xs md:text-sm">
              <span className="flex items-center pr-2 text-slate-600 border-r border-slate-200 mr-2">
                +91
              </span>
              <input
                type="tel"
                className="flex-1 bg-transparent outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 md:text-sm">
              OTP
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 md:text-sm">
                Name (optional)
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                placeholder="Your name (for new account)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 md:text-sm">
                Email (optional)
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70 md:text-sm"
          >
            {isLoading ? "Verifying..." : "Verify OTP & Login"}
          </button>

          <button
            type="button"
            onClick={() => setStep("PHONE")}
            className="w-full text-center text-[11px] text-blue-600 hover:underline md:text-xs"
          >
            Change mobile number
          </button>
        </form>
      )}
    </div>
  );
}
