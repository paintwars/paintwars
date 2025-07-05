import { createConfig, injected, webSocket } from "wagmi";
import { foundry } from "wagmi/chains";

export const config = createConfig({
	chains: [foundry /*etherlinkTestnet*/],
	connectors: [
		injected(),
		// coinbaseWallet({ appName: "Create Wagmi" }),
		// walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
	],
	ssr: true,
	transports: {
		[foundry.id]: webSocket(),
		// [bahamutTestnet.id]: webSocket(),
		// [etherlinkTestnet.id]: http(),
	},
});
