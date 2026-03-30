import { Metadata } from "next";
import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInClient />
    </Suspense>
  );
}
