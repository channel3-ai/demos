"use server";

import { Agent, Runner, tool, setDefaultOpenAIKey } from "@openai/agents";
import { Channel3Client, type Product } from "channel3-sdk";
import type { Message } from "@/lib/types";
import z from "zod";

const c3apiKey = process.env.CHANNEL3_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!c3apiKey) {
  throw new Error("Missing CHANNEL3_API_KEY environment variable.");
}

if (!openaiApiKey) {
  throw new Error(
    "The OPENAI_API_KEY environment variable is missing. Please add it to your .env file."
  );
}

setDefaultOpenAIKey(openaiApiKey);

const c3client = new Channel3Client({
  apiKey: c3apiKey,
});

const instructions = `
You are a friendly and helpful fashion stylist. Your goal is to help users find the perfect clothing, shoes, and accessories.
- When results are presented, briefly summarize them and ask the user for feedback or refinement.
- Be conversational and engaging.
- Keep your responses concise.
`;

export async function searchProducts(
  query?: string,
  base64Image?: string
): Promise<Product[]> {
  try {
    console.log("Searching for products", query);
    const products = await c3client.search({
      query: query,
      imageUrl: undefined,
      base64Image: base64Image,
    });
    console.log(`Found ${products.length} products`);
    return products;
  } catch (error) {
    console.error("Error during Channel3 search:", error);
    return [];
  }
}

const searchProductsTool = tool({
  name: "search_products",
  description: "Search for products",
  parameters: z.object({ query: z.string() }),
  execute: async ({ query }: { query: string }) => {
    return await searchProducts(query);
  },
});

const agent = new Agent({
  name: "Fashion Stylist",
  instructions: instructions,
  tools: [searchProductsTool],
});

const runner = new Runner({ model: "gpt-4-turbo" });

export async function runAgent(messages: Message[]) {
  const resultStream = await runner.run(
    agent,
    messages[messages.length - 1].content || "",
    {
      stream: true,
    }
  );
  return resultStream.toTextStream();
}
