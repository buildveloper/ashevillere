import type { Metadata } from "next";
import { TalkToAIClient } from "./TalkToAIClient";

export const metadata: Metadata = {
  title: "Talk to AI Assistant",
  description:
    "Chat with Asheville's real estate AI assistant. Get instant answers about neighborhoods, market trends, STR regulations, and investing in Asheville, NC.",
  openGraph: {
    title: "Talk to Asheville's Real Estate AI Assistant | AshevilleRE",
    description:
      "Get instant, data-driven answers about Asheville neighborhoods, market trends, and more.",
  },
};

export default function TalkToAIPage() {
  return <TalkToAIClient />;
}
