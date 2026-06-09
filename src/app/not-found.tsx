import type { Metadata } from "next";
import { NotFoundClient } from "./NotFoundClient";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for has moved or doesn't exist.",
};

export default function NotFoundPage() {
  return <NotFoundClient />;
}
