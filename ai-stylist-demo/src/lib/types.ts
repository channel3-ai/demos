import type { Product } from "channel3-sdk";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatSession {
  messages: Message[];
  products: Product[];
}

export interface ChatState {
  sessions: { [chatId: string]: ChatSession };
  activeChatId: string | null;
}
