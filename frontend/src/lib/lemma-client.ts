import { LemmaClient } from "lemma-sdk";

const POD_ID = process.env.NEXT_PUBLIC_LEMMA_POD_ID || "estate-resolve";

let client: LemmaClient | null = null;

export function getLemmaClient(): LemmaClient {
  if (!client) {
    client = new LemmaClient({
      podId: POD_ID,
    });
  }
  return client;
}

export async function initializeClient(): Promise<LemmaClient> {
  const c = getLemmaClient();
  await c.initialize();
  return c;
}
