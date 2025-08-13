import { searchProducts, runAgent } from "./actions";
import { ChatClient } from "./client";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchParamsResult = await searchParams;
  const query = searchParamsResult.query as string;
  // Initial products are fetched on the server
  const initialProducts = await searchProducts(query);

  return <ChatClient initialProducts={initialProducts} runAgent={runAgent} />;
}
