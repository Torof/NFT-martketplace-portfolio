import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

// Use a public RPC for event queries
export const eventClient = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});

// Helper to get a safe fromBlock (within RPC limits)
// Most public RPCs limit to 50k blocks, so we query from (current - 40000)
export async function getSafeFromBlock(): Promise<bigint> {
  try {
    const currentBlock = await eventClient.getBlockNumber();
    // Query last 40k blocks to stay within limits
    const safeFrom = currentBlock > 40000n ? currentBlock - 40000n : 0n;
    return safeFrom;
  } catch {
    // Fallback to a recent block if we can't get current
    return 7750000n;
  }
}
