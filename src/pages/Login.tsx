import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data: LoginForm) => {

  try {

    setError(null);

    const response = await api.sendOTP(data.email);

    if (response.success) {

      setUserEmail(data.email);

      setOtpSent(true);
      setTimer(30);
      setCanResend(false);

    } else {

      setError(response.message);

    }

  } catch (err: any) {

    setError(err.message || "Unable to send OTP.");

  }

};

const handleVerifyOTP = async () => {
  if (otp.join("").length !== 6) return;

  try {

    setError(null);
    setIsVerifyingOTP(true);

    const response = await api.verifyOTP(
  userEmail,
  otp.join("")
);

    if (response.success) {

  login({
    id: response.userId,
    name: response.name,
    email: response.email,
    token: response.token,
    avatarUrl: response.avatarUrl,
    onboardingCompleted: response.onboardingCompleted === true,
    language: response.language || "en",
    occupation: response.occupation || "",
    useCase: response.useCase || "",
  });

  // navigate(response.onboardingCompleted === true ? "/dashboard" : "/onboarding");
  navigate("/dashboard");

} else {

  setError(response.message);

}

  } catch (err: any) {

    setError(err.message || "OTP Verification Failed.");

  } finally {

  setIsVerifyingOTP(false);

}

};

 const onGoogleSuccess = async (
  credentialResponse: CredentialResponse
) => {

  try {

    setError(null);

    const idToken = credentialResponse.credential!;

    const response = await api.googleLogin(idToken);

    if (response.success) {

      login({
        id: response.userId,
        name: response.name,
        email: response.email,
        token: response.token,
        avatarUrl: response.avatarUrl,
        onboardingCompleted: response.onboardingCompleted === true,
        language: response.language || "en",
        occupation: response.occupation || "",
        useCase: response.useCase || "",
      });

      // navigate(
      //   response.onboardingCompleted === true
      //     ? "/dashboard"
      //     : "/onboarding"
      // );

      navigate("/dashboard");

    } else {

      setError(response.message || "Google login failed.");

    }

  } catch (err: any) {

    setError(err.message || "Google login failed.");

  }

};

const onGoogleError = () => {

  setError("Google Sign-In was cancelled or failed.");

};

useEffect(() => {

  if (!otpSent) return;

  if (canResend) return;

  const interval = setInterval(() => {

    setTimer((prev) => {

      if (prev <= 1) {

        clearInterval(interval);

        setCanResend(true);

        return 0;

      }

      return prev - 1;

    });

  }, 1000);

  return () => clearInterval(interval);

}, [otpSent, canResend]);

useEffect(() => {

  if (otp.join("").length !== 6) return;

  if (isVerifyingOTP) return;

  handleVerifyOTP();

}, [otp]);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Welcome</h2>
        <p className="text-text-secondary">Continue with Google or enter your email to receive a secure sign-in code.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-surface border border-danger-border text-danger-text rounded-xl text-sm">
          {error}
        </div>
      )}

      {!otpSent ? (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="email">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="name@example.com"
            className="w-full bg-surface border border-border-default rounded-xl px-4 py-3 focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition-all text-text-primary placeholder:text-text-muted"
          />
          {errors.email && <p className="mt-1 text-sm text-danger-text">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-action-primary text-action-on-primary rounded-xl px-4 py-3 font-medium hover:bg-action-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>
      ) : (

        <div className="space-y-6">

  <div className="text-center">

    <h3 className="text-xl font-semibold">
      Enter Verification Code
    </h3>

    <p className="text-sm text-text-secondary mt-2">
      We sent a 6-digit code to
    </p>

    <p className="font-medium mt-1">
      {userEmail}
    </p>

  </div>

  <div className="flex justify-center gap-3">

  {otp.map((digit, index) => (

    <input
      key={index}
      ref={(el) => {
        otpRefs.current[index] = el;
      }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => {

  const value = e.target.value.replace(/\D/g, "");

  if (!value) return;

  const newOtp = [...otp];

  newOtp[index] = value;

  setOtp(newOtp);

  if (index < 5) {
    otpRefs.current[index + 1]?.focus();
  }

}}

onKeyDown={(e) => {

  if (e.key !== "Backspace") return;

  const newOtp = [...otp];

  if (newOtp[index] !== "") {

    newOtp[index] = "";

    setOtp(newOtp);

    return;

  }

  if (index > 0) {

    newOtp[index - 1] = "";

    setOtp(newOtp);

    otpRefs.current[index - 1]?.focus();

  }

}}

onPaste={(e) => {

  e.preventDefault();

  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (!pasted) return;

  const newOtp = ["", "", "", "", "", ""];

  pasted.split("").forEach((digit, i) => {
    newOtp[i] = digit;
  });

  setOtp(newOtp);

  const lastIndex = Math.min(pasted.length - 1, 5);

  otpRefs.current[lastIndex]?.focus();

}}
      className="w-12 h-14 rounded-xl border border-border-default bg-surface text-center text-xl font-semibold focus:border-text-primary focus:ring-2 focus:ring-text-primary/20 outline-none transition-all"
    />

  ))}

</div>

  <button
  onClick={handleVerifyOTP}
  disabled={isVerifyingOTP}
  className="w-full bg-action-primary text-action-on-primary rounded-xl px-4 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
>

  {isVerifyingOTP ? "Verifying..." : "Verify OTP"}

</button>

  <div className="text-center">

  {canResend ? (

    <button
      type="button"
      onClick={async () => {

        const response = await api.sendOTP(userEmail);

        if (response.success) {

          setTimer(30);

          setCanResend(false);

        } else {

          setError(response.message);

        }

      }}
      className="text-sm font-medium text-primary-green hover:underline"
    >
      Resend OTP
    </button>

  ) : (

    <p className="text-sm text-text-secondary">

      Resend OTP in <span className="font-medium">{timer}s</span>

    </p>

  )}

</div>

  <button
    type="button"
    onClick={() => setOtpSent(false)}
    className="w-full text-sm text-text-secondary"
  >
    Change Email
  </button>

</div>
      )}

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-primary-bg text-text-muted">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
<div className="flex justify-center">

  <GoogleLogin
    onSuccess={onGoogleSuccess}
    onError={onGoogleError}
    theme="outline"
    size="large"
    shape="pill"
    text="continue_with"
    width="360"
  />

</div>
        </div>
      </div>
    </div>
  );
}
