"use client";

import api from "@/utils/api";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { Mail } from "lucide-react";
import { ErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/error";

export default function ResendVerificationClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/resend-verification", { email });
      toast.success("Verification email sent!", {
        description:
          "Check your inbox and click the link to verify your account.",
        duration: 5000,
      });
      router.push("/auth/sign-in");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Failed to send email", {
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
          width={56}
          height={56}
          src="/icon.png"
          alt="Schedli | Icon"
          className="w-10 h-auto"
        />
      </div>
      {/*==================== End of Icon ====================*/}

      <h1 className="text-title font-bold text-heading leading-tight mb-2">
        Resend Verification Email
      </h1>
      <p className="text-body text-text mb-8">
        Enter your email address again to resend the verification email to
        verify your account.
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
          {loading ? "Sending..." : "Send Verification Email"}
        </Button>
        {/*==================== End of Submit Button ====================*/}
      </div>
    </div>
  );
}
