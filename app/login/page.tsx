import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return <LoginForm />;
}
