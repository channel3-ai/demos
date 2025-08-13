"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, ArrowUpIcon, Cross2Icon } from "@radix-ui/react-icons";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSearch = async () => {
    if (!query.trim() && !image) return;
    setIsLoading(true);

    let base64Image: string | undefined = undefined;
    if (image) {
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = (error) => reject(error);
      });
    }

    const newChatId = `chat_${Date.now()}`;
    if (base64Image) {
      sessionStorage.setItem(`b64_img_${newChatId}`, base64Image);
    }

    const params = new URLSearchParams();
    params.append("query", query);
    params.append("chatId", newChatId);

    router.push(`/chat?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <header className="w-full flex justify-between items-center p-4 absolute top-0">
          <div className="flex items-center gap-2">
            <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium">
              Chats
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-serif font-semibold">AI Stylist</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium">Send Feedback</button>
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </header>
        <div className="flex flex-col items-center gap-6 mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            What are you shopping for today?
          </h2>
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-8 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg flex items-center gap-4"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={handleImageButtonClick}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're shopping for..."
            className="flex-grow bg-transparent focus:outline-none resize-none text-base"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          />
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-10 h-10 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5"
              >
                <Cross2Icon className="w-3 h-3" />
              </button>
            </div>
          )}
          {isLoading ? (
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ) : (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
              disabled={!query.trim() && !image}
            >
              <ArrowUpIcon className="w-6 h-6" />
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
