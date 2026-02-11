import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { ALCHEMY_SEPOLIA_URL } from "@/config/alchemy";
import { MARKETPLACE_DEPLOYMENT_BLOCK } from "@/config/contracts";

// Use Alchemy RPC for event queries
export const eventClient = createPublicClient({
  chain: sepolia,
  transport: http(ALCHEMY_SEPOLIA_URL),
});

const CHUNK_SIZE = 50000n;

/**
 * Fetches logs in chunks to avoid RPC block range limits.
 * Queries from MARKETPLACE_DEPLOYMENT_BLOCK to latest in increments of CHUNK_SIZE.
 */
export async function getLogsChunked(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const currentBlock = await eventClient.getBlockNumber();
  const fromBlock = MARKETPLACE_DEPLOYMENT_BLOCK;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs: any[] = [];

  for (let start = fromBlock; start <= currentBlock; start += CHUNK_SIZE + 1n) {
    const end = start + CHUNK_SIZE > currentBlock ? currentBlock : start + CHUNK_SIZE;
    const chunk = await eventClient.getLogs({
      ...params,
      fromBlock: start,
      toBlock: end,
    } as Parameters<typeof eventClient.getLogs>[0]);
    logs.push(...chunk);
  }

  return logs;
}
