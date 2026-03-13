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
import { Checkbox } from "@/components/ui/Checkbox";
import { Eye, Mail, EyeOff, LockKeyhole, CircleUserRound } from "lucide-react";

export default function SignUpClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit() {
    if (!agreedToTerms) {
      toast.error("Terms required", {
        description: "Please agree to the Terms and Conditions to continue.",
        duration: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Make sure both password fields are identical.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { fullName, email, password });
      toast.success("Account created successfully!", {
        description:
          "A verification email has been sent to your inbox. It'll expire in 24 hours.",
        duration: 5000,
      });
      router.push("/auth/sign-in");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Registration failed", {
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
        Create an Account
      </h1>
      <p className="text-body text-text mb-8">
        Organize your repeating schedules effortlessly using Schedli.
      </p>

      <div className="space-y-5">
        {/*==================== Full Name ====================*/}
        <Input
          type="text"
          value={fullName}
          label="Full Name"
          placeholder="John Doe"
          leftIcon={<CircleUserRound size={18} />}
          onChange={(e) => setFullName(e.target.value)}
        />
        {/*==================== End of Full Name ====================*/}

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

        {/*==================== Confirm Password ====================*/}
        <Input
          value={confirmPassword}
          label="Confirm Password"
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

        {/*==================== Terms and Conditions ====================*/}
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          label="Agree To Terms and Conditions"
          onChange={(e) => setAgreedToTerms(e.target.checked)}
        />
        {/*==================== End of Terms and Conditions ====================*/}

        {/*==================== Submit Button ====================*/}
        <Button
          size="lg"
          fullWidth
          className="mt-10"
          variant="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
        {/*==================== End of Submit Button ====================*/}

        <p className="text-center text-small text-text">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
