"use client";

import api from "@/utils/api";
import Image from "next/image";
import { VerifyState } from "@/types";
import { useEffect, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>(token ? "verifying" : "idle");

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        await api.post("/auth/verify-email", { token });
        setState("success");
        setTimeout(() => router.push("/auth/sign-in"), 3000);
      } catch {
        setState("failed");
      }
    }

    verify();
  }, [token, router]);

  const subtitle = token
    ? "Your email is currently being verified. Please wait while this process is being completed."
    : "To complete your account creation process, check your inbox and click the verification link.";

  return (
    <div className="w-full">
      {/*==================== Icon ====================*/}
      <div className="flex justify-center lg:justify-start mb-8">
        <Image
          src="/icon.png"
          alt="Schedli"
          width={56}
          height={56}
          className="w-10 h-auto"
        />
      </div>
      {/*==================== End of Icon ====================*/}

      <h1 className="text-title font-bold text-heading leading-tight mb-2">
        Verify Email
      </h1>
      <p className="text-body text-text mb-8">{subtitle}</p>

      {/*==================== Status ====================*/}
      <div className="mt-8">
        {state === "idle" && (
          <p className="text-center text-small text-text">
            Didn&apos;t receive an email?{" "}
            <button
              onClick={() => router.push("/auth/resend-verification")}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              Resend Verification Link
            </button>
          </p>
        )}

        {state === "verifying" && (
          <p className="text-center font-semibold text-primary">
            Verifying Your Email...
          </p>
        )}

        {state === "success" && (
          <div className="text-center space-y-2">
            <p className="flex items-center justify-center gap-2 font-semibold text-success">
              <CircleCheck size={18} />
              Verification successful!
            </p>
            <p className="text-small text-text">
              Redirecting to Sign In Page...
            </p>
          </div>
        )}

        {state === "failed" && (
          <div className="text-center space-y-3">
            <p className="flex items-center justify-center gap-2 font-semibold text-danger">
              <CircleX size={18} />
              Verification failed!
            </p>
            <button
              onClick={() => router.push("/auth/resend-verification")}
              className="text-small font-semibold text-primary hover:underline cursor-pointer"
            >
              Resend Verification Link
            </button>
          </div>
        )}
      </div>
      {/*==================== End of Status ====================*/}
    </div>
  );
}
