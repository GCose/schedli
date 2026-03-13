import { Metadata } from "next";
import SignUpClient from "./SignUpClient";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignUpPage() {
  return <SignUpClient />;
}
