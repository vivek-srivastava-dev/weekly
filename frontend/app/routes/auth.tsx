import { useState } from "react";
import type { Route } from "./+types/auth";
import { useNavigate } from "react-router";
import { apiFetch } from "../lib/api";

type VerifyOtpResponse = {
  token: string;
  user: { id: string; email?: string; phoneNumber?: string; name?: string };
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Weekly - Sign in" },
    { name: "description", content: "Sign in with OTP to see events." },
  ];
}

export default function Auth() {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fullPhoneNumber = `${countryCode}${phoneNumber}`.trim();

  const handleRequestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await apiFetch("/auth/request-email-otp", {
        method: "POST",
        body: { email },
      });
      setStep("verify");
      setMessage("OTP sent. Please check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await apiFetch<VerifyOtpResponse>("/auth/verify-email-otp", {
        method: "POST",
        body: { email, code: otp, name, phoneNumber: fullPhoneNumber },
      });
      localStorage.setItem("weekly_token", data.token);
      if (data.user.email) {
        localStorage.setItem("weekly_email", data.user.email);
      }
      if (data.user.phoneNumber) {
        localStorage.setItem("weekly_phone", data.user.phoneNumber);
      }
      if (data.user.name) {
        localStorage.setItem("weekly_name", data.user.name);
      }
      navigate("/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Weekly
          </p>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            Plan your weekends, discover amazing events, and RSVP in minutes.
          </h1>
          <p className="mt-4 text-sm text-slate-300">
            Get curated weekend experiences across the city. Secure your seat
            with one-time OTP verification.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Live music nights",
              "Sunrise yoga sessions",
              "Food walks & tastings",
              "Workshops & meetups",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/10 p-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900">Get started</h2>
          <p className="mt-2 text-sm text-gray-600">
            Verify your email to view upcoming events.
          </p>

          <form
            onSubmit={step === "request" ? handleRequestOtp : handleVerifyOtp}
            className="mt-6 space-y-4"
          >
          <div>
            <label className="text-sm font-medium text-gray-700">
              Your name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jon Snow"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mobile number
            </label>
            <div className="mt-2 flex gap-2">
              <select
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
                <option value="+971">+971</option>
              </select>
              <input
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value.replace(/\s+/g, ""))
                }
                placeholder="9876543210"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          {step === "verify" ? (
            <div>
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter 6-digit code"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                required
              />
            </div>
          ) : null}

          {message ? (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : step === "request"
                ? "Send OTP"
                : "Verify & Continue"}
            </button>

            {step === "verify" ? (
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setOtp("");
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Send a new code
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
