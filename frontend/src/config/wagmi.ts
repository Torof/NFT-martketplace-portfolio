import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ALCHEMY_SEPOLIA_URL } from "./alchemy";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [sepolia.id]: http(ALCHEMY_SEPOLIA_URL),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
