import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { WagmiProvider } from "wagmi";
import { store } from "./store/store";
import { config } from "./wagmi";

const queryClient = new QueryClient();

export function Providers(props: { children: ReactNode }) {
	return (
		<Provider store={store}>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					{props.children}
				</QueryClientProvider>
			</WagmiProvider>
		</Provider>
	);
}
