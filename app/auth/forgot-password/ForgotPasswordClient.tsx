"use client";

import api from "@/utils/api";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/error";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent!", {
        description:
          "Check your inbox for the password reset link. It expires in 1 hour.",
        duration: 5000,
      });
      router.push("/auth/sign-in");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Failed to send reset link", {
        description: message,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

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
        Forgot Password
      </h1>
      <p className="text-body text-text mb-8">
        Forgot your password? No worries, provide your email and we&apos;ll send
        a code to reset your password.
      </p>

      <div className="space-y-5">
        {/*==================== Email ====================*/}
        <Input
          type="email"
          label="Email"
          value={email}
          leftIcon={<Mail size={18} />}
          placeholder="johndoe@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
        {/*==================== End of Email ====================*/}

        {/*==================== Submit Button ====================*/}
        <Button
          size="lg"
          fullWidth
          variant="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
        {/*==================== End of Submit Button ====================*/}

        {/*==================== Back To Login ====================*/}
        <Button
          variant="ghost"
          onClick={() => router.push("/auth/sign-in")}
          className="flex items-center gap-1.5 text-small text-text hover:text-heading transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Back To Login
        </Button>
        {/*==================== End of Back To Login ====================*/}
      </div>
    </div>
  );
}
