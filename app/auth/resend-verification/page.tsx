import { Metadata } from "next";
import ResendVerificationClient from "./ResendVerificationClient";

export const metadata: Metadata = {
  title: "Resend Verification Email",
};

export default function ResendVerificationPage() {
  return <ResendVerificationClient />;
}
