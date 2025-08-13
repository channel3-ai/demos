"use client";

import { useState, useEffect } from "react";
import type { Product } from "channel3-sdk";
import type { Message } from "@/lib/types";
import { ArrowUpIcon } from "@radix-ui/react-icons";

interface ChatClientProps {
  initialProducts: Product[];
  runAgent: (messages: Message[]) => Promise<ReadableStream<string>>;
}

export function ChatClient({ initialProducts, runAgent }: ChatClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = { role: "user", content: messageContent };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setInput("");

    const stream = await runAgent(newMessages);
    const reader = stream.getReader();
    let accumulatedResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulatedResponse += value;
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: accumulatedResponse },
          ];
        }
        return prevMessages;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Left side: Chat */}
      <div className="flex flex-col w-1/3 border-r border-gray-200 dark:border-gray-700">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">Chat</h1>
        </header>
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 flex items-center gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-grow bg-transparent focus:outline-none resize-none text-sm pl-1"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"
              disabled={!input.trim()}
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Product Grid */}
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col justify-between"
            >
              <div>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="font-bold text-lg">{product.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {product.brandName}
                </p>
              </div>
              <p className="text-right font-semibold mt-4">
                {product.price ? `$${product.price.price.toFixed(2)}` : ""}
                {product.price.compareAtPrice ? (
                  <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                    ${product.price.compareAtPrice.toFixed(2)}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
