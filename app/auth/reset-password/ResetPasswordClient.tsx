"use client";

import api from "@/utils/api";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/error";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit() {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Make sure both password fields are identical.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password.",
        duration: 5000,
      });
      router.push("/auth/sign-in");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Reset failed", {
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
        Reset Password
      </h1>
      <p className="text-body text-text mb-8">
        To reset your password, provide the new password twice to confirm it.
      </p>

      <div className="space-y-5">
        {/*==================== Password ====================*/}
        <Input
          label="Password"
          value={password}
          placeholder="••••••••••"
          leftIcon={<LockKeyhole size={18} />}
          type={showPassword ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        {/*==================== End of Password ====================*/}

        {/*==================== Confirm Password ====================*/}
        <Input
          label="Confirm Password"
          value={confirmPassword}
          placeholder="••••••••••"
          leftIcon={<LockKeyhole size={18} />}
          type={showConfirmPassword ? "text" : "password"}
          onChange={(e) => setConfirmPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        {/*==================== End of Confirm Password ====================*/}

        {/*==================== Submit Button ====================*/}
        <Button
          size="lg"
          fullWidth
          variant="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
        {/*==================== End of Submit Button ====================*/}
      </div>
    </div>
  );
}
