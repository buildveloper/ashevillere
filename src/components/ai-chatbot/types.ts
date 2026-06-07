// Shared types for the AI Chatbot system

import type { ChatMessage } from "@/lib/chat-context";

export type { ChatMessage };

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
  error: string | null;
}

export interface ChatbotProps {
  pathname: string;
}
