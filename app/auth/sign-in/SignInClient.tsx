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
import { Checkbox } from "@/components/ui/Checkbox";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password, rememberMe });
      toast.success("Welcome back!", {
        description: "You have signed in successfully.",
        duration: 3000,
      });
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/dashboard");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Sign in failed", {
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
        Welcome Back!
      </h1>
      <p className="text-body text-text mb-8">
        Sign in to properly organize your repeating schedules effortlessly using
        Schedli.
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

        {/*==================== Remember Me + Forgot Password ====================*/}
        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            label="Remember Me"
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="text-small font-semibold text-primary hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        {/*==================== End of Remember Me + Forgot Password ====================*/}

        {/*==================== Submit Button ====================*/}
        <Button
          size="lg"
          fullWidth
          className="mt-10"
          variant="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
        {/*==================== End of Submit Button ====================*/}

        <p className="text-center text-small text-text">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
