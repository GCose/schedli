"use client";

import api from "@/utils/api";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/error";

export default function DashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await api.post("/auth/logout");
      toast.success("Logged out", {
        description: "You have been signed out successfully.",
        duration: 3000,
      });
      router.push("/auth/sign-in");
    } catch (err) {
      const { message } = getErrorMessage(err as AxiosError<ErrorResponse>);
      toast.error("Logout failed", {
        description: message,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/*==================== Logout Button ====================*/}
      <Button variant="danger" loading={loading} onClick={handleLogout}>
        {loading ? "Logging out..." : "Log Out"}
      </Button>
      {/*==================== End of Logout Button ====================*/}
    </div>
  );
}
