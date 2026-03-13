import { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return <SignInClient />;
}
